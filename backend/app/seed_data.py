from datetime import date, timedelta
from .database import SessionLocal, Base, engine
from .models import User, Listing, ListingImage, Booking, Review, Wishlist

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(Listing).count() > 0:
        print("Database already has listings. Skipping seed.")
        db.close()
        return

    print("Seeding database with authentic Airbnb data...")

    # 1. Create Users
    host_rohit = User(
        id="user_host_1",
        email="rohit.sharma@airbnb-demo.com",
        full_name="Rohit Sharma",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
        role="host",
        is_superhost=True
    )
    host_ananya = User(
        id="user_host_2",
        email="ananya.verma@airbnb-demo.com",
        full_name="Ananya Verma",
        avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80",
        role="host",
        is_superhost=True
    )
    guest_dhruv = User(
        id="user_guest_1",
        email="dhruv.guest@airbnb-demo.com",
        full_name="Dhruv Patel",
        avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80",
        role="guest",
        is_superhost=False
    )
    reviewer_priya = User(
        id="user_rev_1",
        email="priya.sen@demo.com",
        full_name="Priya Sen",
        avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80",
        role="guest"
    )
    reviewer_alex = User(
        id="user_rev_2",
        email="alex.m@demo.com",
        full_name="Alexander Wright",
        avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
        role="guest"
    )

    db.add_all([host_rohit, host_ananya, guest_dhruv, reviewer_priya, reviewer_alex])
    db.commit()

    # 2. Curated Listings Data
    listings_data = [
        {
            "id": "list_noida_1",
            "host_id": host_rohit.id,
            "title": "Luxury Farm Stay with Private Lawn & Pool",
            "description": "Escape the city hustle into this serene 2-acre private farm estate in Noida. Features a manicured green lawn, private plunge pool, open-concept gazebo, barbecue setup, and sunlit interiors. Perfect for family weekends, creative retreats, and celebrations.",
            "property_type": "Farm stay",
            "category": "farms",
            "city": "Noida",
            "state": "Uttar Pradesh",
            "country": "India",
            "address": "Expressway Sector 135, Noida",
            "latitude": 28.5028,
            "longitude": 77.4045,
            "price_per_night": 15000,
            "cleaning_fee": 1500,
            "service_fee_percent": 12,
            "max_guests": 8,
            "bedrooms": 4,
            "beds": 5,
            "bathrooms": 4,
            "is_guest_favourite": True,
            "amenities": ["Wifi", "Private pool", "Free parking on premises", "Kitchen", "Air conditioning", "BBQ grill", "Patio or balcony", "Garden view"],
            "images": [
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
            ]
        },
        {
            "id": "list_noida_2",
            "host_id": host_ananya.id,
            "title": "The House Of Livora | A Vintage Stay in Noida",
            "description": "The House of Livora is created for travellers who appreciate beauty beyond the ordinary. This apartment is a celebration of timeless design, refined comfort, and meaningful hospitality. From handcrafted details to elegant interiors, every space has been curated to make you feel at home while experiencing the charm of a vintage luxury retreat.",
            "property_type": "Flat",
            "category": "popular",
            "city": "Noida",
            "state": "Uttar Pradesh",
            "country": "India",
            "address": "Sector 75, Noida",
            "latitude": 28.5744,
            "longitude": 77.3821,
            "price_per_night": 5223,
            "cleaning_fee": 600,
            "service_fee_percent": 12,
            "max_guests": 3,
            "bedrooms": 1,
            "beds": 1,
            "bathrooms": 1,
            "is_guest_favourite": True,
            "amenities": ["Wifi", "Dedicated workspace", "Free parking", "Kitchen", "Elevator", "Air conditioning", "55-inch HDTV", "Washing machine"],
            "images": [
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80"
            ]
        },
        {
            "id": "list_noida_3",
            "host_id": host_rohit.id,
            "title": "Boho Velvet Studio near Metro Sector 63",
            "description": "Vibrant and aesthetic studio apartment decked out in warm velvet red and golden accents. Equipped with high-speed 300 Mbps fiber optic wifi, ergonomic workspace, and a cozy coffee nook. Walking distance to corporate hubs.",
            "property_type": "Flat",
            "category": "popular",
            "city": "Noida",
            "state": "Uttar Pradesh",
            "country": "India",
            "address": "Electronic City, Sector 63, Noida",
            "latitude": 28.6280,
            "longitude": 77.3800,
            "price_per_night": 5000,
            "cleaning_fee": 500,
            "service_fee_percent": 12,
            "max_guests": 2,
            "bedrooms": 1,
            "beds": 1,
            "bathrooms": 1,
            "is_guest_favourite": True,
            "amenities": ["Wifi", "Air conditioning", "Kitchenette", "Dedicated workspace", "Netflix / Prime Video", "Hair dryer"],
            "images": [
                "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
            ]
        },
        {
            "id": "list_noida_4",
            "host_id": host_ananya.id,
            "title": "Minimalist Scandinavian Flat with Garden Balcony",
            "description": "Flooded with natural sunlight, this minimalist flat boasts pastel botanical tones, mid-century furniture, indoor plants, and a serene balcony garden. Enjoy early morning yoga with open skyline vistas.",
            "property_type": "Flat",
            "category": "popular",
            "city": "Noida",
            "state": "Uttar Pradesh",
            "country": "India",
            "address": "Sector 50, Noida",
            "latitude": 28.5700,
            "longitude": 77.3600,
            "price_per_night": 5850,
            "cleaning_fee": 700,
            "service_fee_percent": 12,
            "max_guests": 3,
            "bedrooms": 1,
            "beds": 2,
            "bathrooms": 1,
            "is_guest_favourite": True,
            "amenities": ["Wifi", "Balcony garden", "Free parking", "Full kitchen", "Air conditioning", "Washer", "Iron"],
            "images": [
                "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=800&q=80"
            ]
        },
        {
            "id": "list_noida_5",
            "host_id": host_rohit.id,
            "title": "Penthouse with Jacuzzi & Golf Course Views",
            "description": "Ultra-luxe penthouse in Sector 94 with direct elevator access, private terrace jacuzzi, contemporary European aesthetics, ambient multi-zone audio, and a premium designer kitchen.",
            "property_type": "Flat",
            "category": "luxury",
            "city": "Noida",
            "state": "Uttar Pradesh",
            "country": "India",
            "address": "Supernova Spira, Sector 94, Noida",
            "latitude": 28.5480,
            "longitude": 77.3270,
            "price_per_night": 12500,
            "cleaning_fee": 1200,
            "service_fee_percent": 12,
            "max_guests": 4,
            "bedrooms": 2,
            "beds": 2,
            "bathrooms": 3,
            "is_guest_favourite": True,
            "amenities": ["Wifi", "Hot tub / Jacuzzi", "Private gym access", "Infinity pool", "Valet parking", "Full kitchen", "Air conditioning"],
            "images": [
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80"
            ]
        },
        {
            "id": "list_gurgaon_1",
            "host_id": host_ananya.id,
            "title": "Chic Golf Course Road Glass Villa",
            "description": "Modern architectural masterpiece featuring open-plan living, private swimming pool, landscaped lawn, and designer interiors. Walking distance to DLF Cyber Hub and Horizon Centre.",
            "property_type": "Villa",
            "category": "pools",
            "city": "Gurgaon",
            "state": "Haryana",
            "country": "India",
            "address": "DLF Phase 5, Golf Course Road, Gurgaon",
            "latitude": 28.4595,
            "longitude": 77.0266,
            "price_per_night": 18500,
            "cleaning_fee": 2000,
            "service_fee_percent": 12,
            "max_guests": 6,
            "bedrooms": 3,
            "beds": 3,
            "bathrooms": 4,
            "is_guest_favourite": True,
            "amenities": ["Private pool", "Wifi", "BBQ grill", "Chef on call", "Free parking", "EV charger", "Air conditioning"],
            "images": [
                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80"
            ]
        },
        {
            "id": "list_goa_1",
            "host_id": host_rohit.id,
            "title": "Sun-Kissed Portuguese Heritage Villa with Private Pool",
            "description": "Experience true Goan tranquility in this 150-year-old restored Portuguese villa in Anjuna. Stroll through antique arches, relax in private courtyard pool, and listen to the Arabian waves at sunset.",
            "property_type": "Villa",
            "category": "beachfront",
            "city": "Goa",
            "state": "Goa",
            "country": "India",
            "address": "Anjuna Beach Road, Goa",
            "latitude": 15.5733,
            "longitude": 73.7412,
            "price_per_night": 14000,
            "cleaning_fee": 1500,
            "service_fee_percent": 12,
            "max_guests": 6,
            "bedrooms": 3,
            "beds": 4,
            "bathrooms": 3,
            "is_guest_favourite": True,
            "amenities": ["Beach access", "Private pool", "Wifi", "Kitchen", "Free parking", "Air conditioning", "Outdoor shower"],
            "images": [
                "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
            ]
        },
        {
            "id": "list_manali_1",
            "host_id": host_ananya.id,
            "title": "Rustic Cedar Wood Cabin with Himalayan Snow Views",
            "description": "Nestled in pine and cedar groves with panoramic views of the Pir Panjal ranges. Features a crackling stone fireplace, heated wooden floors, stargazing skylight, and outdoor bonfire pit.",
            "property_type": "Cabin",
            "category": "cabins",
            "city": "Manali",
            "state": "Himachal Pradesh",
            "country": "India",
            "address": "Old Manali, Manali",
            "latitude": 32.2432,
            "longitude": 77.1892,
            "price_per_night": 7200,
            "cleaning_fee": 800,
            "service_fee_percent": 12,
            "max_guests": 4,
            "bedrooms": 2,
            "beds": 2,
            "bathrooms": 2,
            "is_guest_favourite": True,
            "amenities": ["Mountain view", "Indoor fireplace", "Wifi", "Dedicated workspace", "Free parking", "Heating", "Kitchen"],
            "images": [
                "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80"
            ]
        },
        {
            "id": "list_jaipur_1",
            "host_id": host_rohit.id,
            "title": "Royal Heritage Haveli Suite with Marble Courtyard",
            "description": "Live like royalty in this regal heritage haveli featuring handcrafted jharokhas, traditional Rajasthani frescoes, antique brass beds, and candlelit courtyard dinners.",
            "property_type": "Villa",
            "category": "luxury",
            "city": "Jaipur",
            "state": "Rajasthan",
            "country": "India",
            "address": "Civil Lines, Jaipur",
            "latitude": 26.9124,
            "longitude": 75.7873,
            "price_per_night": 9500,
            "cleaning_fee": 1000,
            "service_fee_percent": 12,
            "max_guests": 4,
            "bedrooms": 2,
            "beds": 2,
            "bathrooms": 2,
            "is_guest_favourite": True,
            "amenities": ["Air conditioning", "Wifi", "Heritage courtyard", "Breakfast included", "Free parking", "Security cameras"],
            "images": [
                "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
            ]
        },
        {
            "id": "list_paris_1",
            "host_id": host_ananya.id,
            "title": "Romantic Montmartre Artist Loft with Eiffel View",
            "description": "Authentic Parisian charm on the cobblestones of Montmartre. High ceilings, exposed timber beams, clawfoot bathtub, vinyl record player, and distant twinkling views of the Eiffel Tower.",
            "property_type": "Loft",
            "category": "iconic_cities",
            "city": "Paris",
            "state": "Île-de-France",
            "country": "France",
            "address": "Rue Lepic, Montmartre, Paris",
            "latitude": 48.8867,
            "longitude": 2.3338,
            "price_per_night": 22000,
            "cleaning_fee": 2500,
            "service_fee_percent": 12,
            "max_guests": 2,
            "bedrooms": 1,
            "beds": 1,
            "bathrooms": 1,
            "is_guest_favourite": True,
            "amenities": ["Eiffel Tower view", "Wifi", "Espresso machine", "Bathtub", "Heating", "Dedicated workspace"],
            "images": [
                "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80"
            ]
        }
    ]

    for item in listings_data:
        images = item.pop("images")
        listing = Listing(**item)
        db.add(listing)
        db.flush()

        for idx, img_url in enumerate(images):
            image = ListingImage(
                listing_id=listing.id,
                url=img_url,
                display_order=idx,
                is_cover=(idx == 0)
            )
            db.add(image)

        # Add 2 realistic reviews for each listing
        rev1 = Review(
            listing_id=listing.id,
            author_id=reviewer_priya.id,
            rating_overall=5.0,
            rating_cleanliness=5,
            rating_accuracy=5,
            rating_communication=5,
            rating_location=5,
            rating_value=5,
            comment="Absolutely exceeded our expectations! The place is sparkling clean and looks even better in person than the photos. Rohit was an exceptional host and gave us great local food recommendations."
        )
        rev2 = Review(
            listing_id=listing.id,
            author_id=reviewer_alex.id,
            rating_overall=4.9,
            rating_cleanliness=5,
            rating_accuracy=5,
            rating_communication=5,
            rating_location=4,
            rating_value=5,
            comment="Flawless check-in process, super fast wifi for my remote work calls, and lovely morning vibes. Will definitely book this again next time I'm in town!"
        )
        db.add_all([rev1, rev2])

    # 3. Add Pre-existing Confirmed Bookings for demonstrative date blocking
    today = date.today()
    demo_booking_1 = Booking(
        listing_id="list_noida_2",
        guest_id=guest_dhruv.id,
        check_in=today + timedelta(days=5),
        check_out=today + timedelta(days=8),
        total_nights=3,
        guest_count=2,
        base_price=15669,
        cleaning_fee=600,
        service_fee=1880,
        total_price=18149,
        status="confirmed"
    )
    demo_booking_2 = Booking(
        listing_id="list_goa_1",
        guest_id=guest_dhruv.id,
        check_in=today + timedelta(days=12),
        check_out=today + timedelta(days=16),
        total_nights=4,
        guest_count=4,
        base_price=56000,
        cleaning_fee=1500,
        service_fee=6720,
        total_price=64220,
        status="confirmed"
    )
    db.add_all([demo_booking_1, demo_booking_2])

    # 4. Add Initial Wishlists
    db.add(Wishlist(user_id=guest_dhruv.id, listing_id="list_noida_1"))
    db.add(Wishlist(user_id=guest_dhruv.id, listing_id="list_gurgaon_1"))

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
