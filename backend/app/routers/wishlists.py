from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Wishlist, Listing, User
from ..schemas import WishlistToggle, WishlistResponse, ListingSummary
from .auth import get_current_user
from .listings import compute_listing_summary

router = APIRouter(prefix="/api/wishlists", tags=["wishlists"])

@router.post("/toggle", response_model=WishlistResponse)
def toggle_wishlist(
    payload: WishlistToggle,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.listing_id == payload.listing_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return WishlistResponse(listing_id=payload.listing_id, is_saved=False)
    else:
        new_item = Wishlist(user_id=current_user.id, listing_id=payload.listing_id)
        db.add(new_item)
        db.commit()
        return WishlistResponse(listing_id=payload.listing_id, is_saved=True)

@router.get("", response_model=List[ListingSummary])
def get_user_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wishlists = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()
    results = []
    for w in wishlists:
        if w.listing:
            results.append(compute_listing_summary(w.listing, db))
    return results

@router.get("/ids", response_model=List[str])
def get_user_wishlist_ids(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(Wishlist.listing_id).filter(Wishlist.user_id == current_user.id).all()
    return [item[0] for item in items]
