from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, Listing, User
from ..schemas import BookingCreate, BookingResponse, BookedDateRange
from .auth import get_current_user
from .listings import compute_listing_summary

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

@router.post("", response_model=BookingResponse)
def create_booking(
    payload: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.check_in >= payload.check_out:
        raise HTTPException(status_code=400, detail="Check-in date must be before check-out date")
        
    if payload.check_in < date.today():
        raise HTTPException(status_code=400, detail="Check-in date cannot be in the past")

    listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if payload.guest_count > listing.max_guests:
        raise HTTPException(
            status_code=400,
            detail=f"This listing accommodates a maximum of {listing.max_guests} guests"
        )

    # Check for date overlap with any confirmed booking
    overlap = db.query(Booking).filter(
        Booking.listing_id == payload.listing_id,
        Booking.status == "confirmed",
        Booking.check_in < payload.check_out,
        Booking.check_out > payload.check_in
    ).first()

    if overlap:
        raise HTTPException(
            status_code=409,
            detail="Selected dates are no longer available. Please choose different dates."
        )

    # Compute financial breakdown accurately on the server
    total_nights = (payload.check_out - payload.check_in).days
    base_price = total_nights * listing.price_per_night
    cleaning_fee = listing.cleaning_fee or 0
    service_fee = int(base_price * (listing.service_fee_percent / 100.0))
    total_price = base_price + cleaning_fee + service_fee

    booking = Booking(
        listing_id=listing.id,
        guest_id=current_user.id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        total_nights=total_nights,
        guest_count=payload.guest_count,
        base_price=base_price,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        total_price=total_price,
        status="confirmed"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Construct response with listing summary
    summary = compute_listing_summary(listing, db)
    return BookingResponse(
        id=booking.id,
        listing_id=booking.listing_id,
        guest_id=booking.guest_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        total_nights=booking.total_nights,
        guest_count=booking.guest_count,
        base_price=booking.base_price,
        cleaning_fee=booking.cleaning_fee,
        service_fee=booking.service_fee,
        total_price=booking.total_price,
        status=booking.status,
        created_at=booking.created_at,
        listing=summary
    )

@router.get("/my-trips", response_model=List[BookingResponse])
def get_my_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bookings = db.query(Booking).filter(
        Booking.guest_id == current_user.id
    ).order_by(Booking.check_in.desc()).all()

    results = []
    for b in bookings:
        summary = compute_listing_summary(b.listing, db)
        results.append(
            BookingResponse(
                id=b.id,
                listing_id=b.listing_id,
                guest_id=b.guest_id,
                check_in=b.check_in,
                check_out=b.check_out,
                total_nights=b.total_nights,
                guest_count=b.guest_count,
                base_price=b.base_price,
                cleaning_fee=b.cleaning_fee,
                service_fee=b.service_fee,
                total_price=b.total_price,
                status=b.status,
                created_at=b.created_at,
                listing=summary
            )
        )
    return results

@router.get("/listing/{id}", response_model=List[BookedDateRange])
def get_listing_booked_dates(id: str, db: Session = Depends(get_db)):
    bookings = db.query(Booking).filter(
        Booking.listing_id == id,
        Booking.status == "confirmed",
        Booking.check_out >= date.today()
    ).all()
    return [BookedDateRange(check_in=b.check_in, check_out=b.check_out) for b in bookings]

@router.delete("/{id}")
def cancel_booking(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.guest_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")

    booking.status = "cancelled"
    db.commit()
    return {"message": "Booking cancelled successfully", "id": id}
