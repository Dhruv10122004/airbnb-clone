from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

# ----------------- User Schemas -----------------
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    avatar_url: Optional[str] = None
    role: str = "guest"
    is_superhost: bool = False

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Image Schemas -----------------
class ListingImageBase(BaseModel):
    url: str
    caption: Optional[str] = None
    display_order: int = 0
    is_cover: bool = False

class ListingImageCreate(ListingImageBase):
    pass

class ListingImageResponse(ListingImageBase):
    id: str

    class Config:
        from_attributes = True

# ----------------- Review Schemas -----------------
class ReviewCreate(BaseModel):
    rating_overall: float = Field(..., ge=1.0, le=5.0)
    rating_cleanliness: int = Field(5, ge=1, le=5)
    rating_accuracy: int = Field(5, ge=1, le=5)
    rating_communication: int = Field(5, ge=1, le=5)
    rating_location: int = Field(5, ge=1, le=5)
    rating_value: int = Field(5, ge=1, le=5)
    comment: str

class ReviewResponse(BaseModel):
    id: str
    rating_overall: float
    rating_cleanliness: int
    rating_accuracy: int
    rating_communication: int
    rating_location: int
    rating_value: int
    comment: str
    created_at: datetime
    author: UserResponse

    class Config:
        from_attributes = True

# ----------------- Listing Schemas -----------------
class ListingBase(BaseModel):
    title: str
    description: str
    property_type: str = "Flat"
    category: str = "popular"
    city: str
    state: Optional[str] = None
    country: str = "India"
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: int
    cleaning_fee: int = 500
    service_fee_percent: int = 12
    max_guests: int = 2
    bedrooms: int = 1
    beds: int = 1
    bathrooms: int = 1
    amenities: List[str] = []
    is_guest_favourite: bool = True

class ListingCreate(ListingBase):
    image_urls: List[str] = []

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[str] = None
    category: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: Optional[int] = None
    cleaning_fee: Optional[int] = None
    max_guests: Optional[int] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    bathrooms: Optional[int] = None
    amenities: Optional[List[str]] = None
    image_urls: Optional[List[str]] = None

class ListingSummary(BaseModel):
    id: str
    title: str
    property_type: str
    category: str
    city: str
    state: Optional[str] = None
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: int
    is_guest_favourite: bool
    cover_image: Optional[str] = None
    images: List[str] = []
    average_rating: float = 5.0
    review_count: int = 0

    class Config:
        from_attributes = True

class BookedDateRange(BaseModel):
    check_in: date
    check_out: date

class ListingDetail(ListingBase):
    id: str
    host: UserResponse
    images: List[ListingImageResponse] = []
    reviews: List[ReviewResponse] = []
    average_rating: float = 5.0
    review_count: int = 0
    booked_dates: List[BookedDateRange] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ----------------- Booking Schemas -----------------
class BookingCreate(BaseModel):
    listing_id: str
    check_in: date
    check_out: date
    guest_count: int = 1

class BookingResponse(BaseModel):
    id: str
    listing_id: str
    guest_id: str
    check_in: date
    check_out: date
    total_nights: int
    guest_count: int
    base_price: int
    cleaning_fee: int
    service_fee: int
    total_price: int
    status: str
    created_at: datetime
    listing: ListingSummary

    class Config:
        from_attributes = True

# ----------------- Wishlist Schemas -----------------
class WishlistToggle(BaseModel):
    listing_id: str

class WishlistResponse(BaseModel):
    listing_id: str
    is_saved: bool
