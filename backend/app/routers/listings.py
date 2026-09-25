from datetime import date
import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from ..database import get_db
from ..models import Listing, ListingImage, Review, Booking, User
from ..schemas import (
    ListingSummary,
    ListingDetail,
    ListingCreate,
    ListingUpdate,
    BookedDateRange,
    UserResponse,
    ListingImageResponse,
    ReviewResponse
)
from .auth import get_current_user

router = APIRouter(prefix="/api/listings", tags=["listings"])

def compute_listing_summary(listing: Listing, db: Session) -> ListingSummary:
    images = [img.url for img in listing.images]
    cover_image = images[0] if images else "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"
    
    # Calculate average rating
    rating_data = db.query(
        func.avg(Review.rating_overall),
        func.count(Review.id)
    ).filter(Review.listing_id == listing.id).first()
    
    avg_rating = round(float(rating_data[0] or 5.0), 2)
    review_cnt = int(rating_data[1] or 0)

    return ListingSummary(
        id=listing.id,
        title=listing.title,
        property_type=listing.property_type,
        category=listing.category,
        city=listing.city,
        state=listing.state,
        country=listing.country,
        latitude=listing.latitude,
        longitude=listing.longitude,
        price_per_night=listing.price_per_night,
        is_guest_favourite=listing.is_guest_favourite,
        cover_image=cover_image,
        images=images,
        average_rating=avg_rating,
        review_count=review_cnt
    )

@router.get("", response_model=List[ListingSummary])
def get_listings(
    category: Optional[str] = None,
    destination: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    property_type: Optional[str] = None,
    guests: Optional[int] = None,
    amenities: Optional[str] = None,  # comma-separated
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Listing)

    # Filter by category (e.g., beachfront, cabins, farms, etc.)
    if category and category.lower() != "all":
        query = query.filter(func.lower(Listing.category) == category.lower())

    # Filter by destination/location
    if destination and destination.strip():
        dest_clean = destination.strip().lower()
        if dest_clean not in ["nearby", "anywhere", "all"]:
            # Extract primary locality before comma (e.g. "Noida" from "Noida, Uttar Pradesh")
            primary_part = dest_clean.split(",")[0].strip()
            tokens = [t.strip() for t in re.split(r'[,/\s]+', dest_clean) if t.strip()]
            significant_tokens = [t for t in tokens if t not in ["district", "near", "nearby", "in", "area", "the"]]

            primary_tokens = [t.strip() for t in re.split(r'[,/\s]+', primary_part) if t.strip()]
            significant_primary = [t for t in primary_tokens if t not in ["district", "near", "nearby", "in", "area", "the"]]

            # Condition 1: All significant tokens match across location fields (city, state, country, address, title)
            all_tokens_filter = []
            for token in (significant_tokens or tokens):
                term = f"%{token}%"
                all_tokens_filter.append(
                    or_(
                        func.lower(Listing.city).like(term),
                        func.lower(Listing.state).like(term),
                        func.lower(Listing.country).like(term),
                        func.lower(Listing.address).like(term),
                        func.lower(Listing.title).like(term)
                    )
                )

            # Condition 2: Primary locality (e.g. "noida", "gurgaon") matches city, address, or title
            primary_filters = []
            for token in (significant_primary or primary_tokens or tokens):
                term = f"%{token}%"
                primary_filters.append(
                    or_(
                        func.lower(Listing.city).like(term),
                        func.lower(Listing.address).like(term),
                        func.lower(Listing.title).like(term)
                    )
                )

            # Match if all tokens match across the fields OR if the primary locality matches
            if all_tokens_filter and primary_filters:
                query = query.filter(or_(and_(*all_tokens_filter), and_(*primary_filters)))
            elif all_tokens_filter:
                query = query.filter(and_(*all_tokens_filter))
            elif primary_filters:
                query = query.filter(and_(*primary_filters))

    # Filter by price range
    if min_price is not None:
        query = query.filter(Listing.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price_per_night <= max_price)

    # Filter by property type
    if property_type and property_type.lower() != "all":
        query = query.filter(func.lower(Listing.property_type) == property_type.lower())

    # Filter by guest capacity
    if guests and guests > 0:
        query = query.filter(Listing.max_guests >= guests)

    # Filter by available dates (exclude listings with overlapping bookings)
    if check_in and check_out:
        if check_in >= check_out:
            raise HTTPException(status_code=400, detail="check_in must be before check_out")
        
        # Subquery for listing IDs with conflicting confirmed bookings
        conflicting_listings = db.query(Booking.listing_id).filter(
            Booking.status == "confirmed",
            Booking.check_in < check_out,
            Booking.check_out > check_in
        ).subquery()
        
        query = query.filter(~Listing.id.in_(conflicting_listings))

    listings = query.order_by(Listing.created_at.desc()).offset(offset).limit(limit).all()

    # In-memory filter for amenities if specified
    if amenities:
        required_amenities = [a.strip().lower() for a in amenities.split(",") if a.strip()]
        if required_amenities:
            listings = [
                l for l in listings
                if all(any(req in (item or "").lower() for item in (l.amenities or [])) for req in required_amenities)
            ]

    return [compute_listing_summary(l, db) for l in listings]

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = [
        {"id": "all", "label": "All", "icon": "globe"},
        {"id": "popular", "label": "Popular", "icon": "sparkles"},
        {"id": "farms", "label": "Farms", "icon": "tractor"},
        {"id": "beachfront", "label": "Beachfront", "icon": "umbrella"},
        {"id": "cabins", "label": "Cabins", "icon": "trees"},
        {"id": "luxury", "label": "Luxury", "icon": "gem"},
        {"id": "iconic_cities", "label": "Iconic cities", "icon": "building-2"},
        {"id": "pools", "label": "Amazing pools", "icon": "waves"},
        {"id": "mountains", "label": "Top of the world", "icon": "mountain-snow"},
    ]
    return categories

@router.get("/{id}", response_model=ListingDetail)
def get_listing_by_id(id: str, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Aggregate ratings
    rating_data = db.query(
        func.avg(Review.rating_overall),
        func.count(Review.id)
    ).filter(Review.listing_id == listing.id).first()
    
    avg_rating = round(float(rating_data[0] or 5.0), 2)
    review_cnt = int(rating_data[1] or 0)

    # Fetch booked date ranges for calendar blocking
    bookings = db.query(Booking).filter(
        Booking.listing_id == listing.id,
        Booking.status == "confirmed",
        Booking.check_out >= date.today()
    ).all()
    
    booked_ranges = [
        BookedDateRange(check_in=b.check_in, check_out=b.check_out)
        for b in bookings
    ]

    return ListingDetail(
        id=listing.id,
        title=listing.title,
        description=listing.description,
        property_type=listing.property_type,
        category=listing.category,
        city=listing.city,
        state=listing.state,
        country=listing.country,
        address=listing.address,
        latitude=listing.latitude,
        longitude=listing.longitude,
        price_per_night=listing.price_per_night,
        cleaning_fee=listing.cleaning_fee,
        service_fee_percent=listing.service_fee_percent,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        amenities=listing.amenities or [],
        is_guest_favourite=listing.is_guest_favourite,
        host=UserResponse.model_validate(listing.host),
        images=[ListingImageResponse.model_validate(img) for img in listing.images],
        reviews=[ReviewResponse.model_validate(rev) for rev in listing.reviews],
        average_rating=avg_rating,
        review_count=review_cnt,
        booked_dates=booked_ranges,
        created_at=listing.created_at,
        updated_at=listing.updated_at
    )

@router.post("", response_model=ListingDetail)
def create_listing(
    payload: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = Listing(
        host_id=current_user.id,
        title=payload.title,
        description=payload.description,
        property_type=payload.property_type,
        category=payload.category,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        address=payload.address,
        latitude=payload.latitude,
        longitude=payload.longitude,
        price_per_night=payload.price_per_night,
        cleaning_fee=payload.cleaning_fee,
        service_fee_percent=payload.service_fee_percent,
        max_guests=payload.max_guests,
        bedrooms=payload.bedrooms,
        beds=payload.beds,
        bathrooms=payload.bathrooms,
        amenities=payload.amenities,
        is_guest_favourite=payload.is_guest_favourite
    )
    db.add(listing)
    db.flush()

    # Add images
    for index, url in enumerate(payload.image_urls):
        image = ListingImage(
            listing_id=listing.id,
            url=url,
            display_order=index,
            is_cover=(index == 0)
        )
        db.add(image)

    # Ensure user has host role
    if current_user.role != "host":
        current_user.role = "host"
        db.add(current_user)

    db.commit()
    db.refresh(listing)
    return get_listing_by_id(listing.id, db)

@router.put("/{id}", response_model=ListingDetail)
def update_listing(
    id: str,
    payload: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if listing.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this listing")

    update_data = payload.model_dump(exclude_unset=True)
    image_urls = update_data.pop("image_urls", None)

    for key, value in update_data.items():
        setattr(listing, key, value)

    if image_urls is not None:
        # Replace images
        db.query(ListingImage).filter(ListingImage.listing_id == listing.id).delete()
        for index, url in enumerate(image_urls):
            img = ListingImage(
                listing_id=listing.id,
                url=url,
                display_order=index,
                is_cover=(index == 0)
            )
            db.add(img)

    db.commit()
    db.refresh(listing)
    return get_listing_by_id(listing.id, db)

@router.delete("/{id}")
def delete_listing(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    if listing.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")

    db.delete(listing)
    db.commit()
    return {"message": "Listing deleted successfully", "id": id}
