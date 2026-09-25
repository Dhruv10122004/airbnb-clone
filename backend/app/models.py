import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Date,
    ForeignKey,
    Text,
    JSON,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    role = Column(String, default="guest")  # "guest" or "host"
    is_superhost = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    listings = relationship("Listing", back_populates="host", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="guest", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="author", cascade="all, delete-orphan")
    wishlists = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")

class Listing(Base):
    __tablename__ = "listings"

    id = Column(String, primary_key=True, default=generate_uuid)
    host_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    property_type = Column(String, nullable=False)  # "Flat", "Farm stay", "Villa", "Cabin", "Loft"
    category = Column(String, index=True, nullable=False)  # "popular", "farms", "luxury", "beachfront", "cabins", "trending"
    city = Column(String, index=True, nullable=False)
    state = Column(String, nullable=True)
    country = Column(String, nullable=False, default="India")
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    price_per_night = Column(Integer, nullable=False)
    cleaning_fee = Column(Integer, default=500)
    service_fee_percent = Column(Integer, default=12)  # 12% standard
    
    max_guests = Column(Integer, default=2)
    bedrooms = Column(Integer, default=1)
    beds = Column(Integer, default=1)
    bathrooms = Column(Integer, default=1)
    
    amenities = Column(JSON, default=list)  # ["Wifi", "Kitchen", "Free parking", "Pool", "Air conditioning"]
    is_guest_favourite = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    host = relationship("User", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan", order_by="ListingImage.display_order")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")
    wishlists = relationship("Wishlist", back_populates="listing", cascade="all, delete-orphan")

class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(String, primary_key=True, default=generate_uuid)
    listing_id = Column(String, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    url = Column(String, nullable=False)
    caption = Column(String, nullable=True)
    display_order = Column(Integer, default=0)
    is_cover = Column(Boolean, default=False)

    listing = relationship("Listing", back_populates="images")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=generate_uuid)
    listing_id = Column(String, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    guest_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    total_nights = Column(Integer, nullable=False)
    guest_count = Column(Integer, default=1)
    
    base_price = Column(Integer, nullable=False)
    cleaning_fee = Column(Integer, default=0)
    service_fee = Column(Integer, default=0)
    total_price = Column(Integer, nullable=False)
    
    status = Column(String, default="confirmed")  # "confirmed", "cancelled"
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("Listing", back_populates="bookings")
    guest = relationship("User", back_populates="bookings")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, default=generate_uuid)
    listing_id = Column(String, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    rating_overall = Column(Float, nullable=False)
    rating_cleanliness = Column(Integer, default=5)
    rating_accuracy = Column(Integer, default=5)
    rating_communication = Column(Integer, default=5)
    rating_location = Column(Integer, default=5)
    rating_value = Column(Integer, default=5)
    
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("Listing", back_populates="reviews")
    author = relationship("User", back_populates="reviews")

class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(String, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="wishlists")
    listing = relationship("Listing", back_populates="wishlists")

    __table_args__ = (
        UniqueConstraint("user_id", "listing_id", name="uq_user_listing_wishlist"),
    )
