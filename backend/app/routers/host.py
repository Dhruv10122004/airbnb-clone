from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from ..database import get_db
from ..models import Listing, Booking, User
from ..schemas import ListingSummary, BookingResponse
from .auth import get_current_user
from .listings import compute_listing_summary

router = APIRouter(prefix="/api/host", tags=["host"])

@router.get("/listings", response_model=List[ListingSummary])
def get_host_listings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listings = db.query(Listing).filter(Listing.host_id == current_user.id).order_by(Listing.created_at.desc()).all()
    return [compute_listing_summary(l, db) for l in listings]

@router.get("/reservations", response_model=List[BookingResponse])
def get_host_reservations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find bookings for any listing owned by this host
    bookings = db.query(Booking).join(Listing).filter(
        Listing.host_id == current_user.id
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

@router.get("/stats")
def get_host_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_listings = db.query(Listing).filter(Listing.host_id == current_user.id).count()
    
    reservations = db.query(Booking).join(Listing).filter(
        Listing.host_id == current_user.id,
        Booking.status == "confirmed"
    ).all()
    
    total_reservations = len(reservations)
    total_earnings = sum(r.base_price + r.cleaning_fee for r in reservations)
    
    return {
        "total_listings": total_listings,
        "total_reservations": total_reservations,
        "total_earnings": total_earnings,
        "is_superhost": current_user.is_superhost
    }
