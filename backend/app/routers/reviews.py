from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Review, Listing, User
from ..schemas import ReviewCreate, ReviewResponse
from .auth import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["reviews"])

@router.post("/{listing_id}", response_model=ReviewResponse)
def add_review(
    listing_id: str,
    payload: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    review = Review(
        listing_id=listing_id,
        author_id=current_user.id,
        rating_overall=payload.rating_overall,
        rating_cleanliness=payload.rating_cleanliness,
        rating_accuracy=payload.rating_accuracy,
        rating_communication=payload.rating_communication,
        rating_location=payload.rating_location,
        rating_value=payload.rating_value,
        comment=payload.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.get("/{listing_id}", response_model=List[ReviewResponse])
def get_listing_reviews(
    listing_id: str,
    db: Session = Depends(get_db)
):
    reviews = db.query(Review).filter(Review.listing_id == listing_id).order_by(Review.created_at.desc()).all()
    return reviews
