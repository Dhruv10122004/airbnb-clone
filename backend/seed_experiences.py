import sqlite3

db_path = r'c:\Users\lenovo\airbnb-clone\backend\airbnb.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Ensure Host Uvais exists
cursor.execute('''
INSERT OR REPLACE INTO users (id, email, full_name, avatar_url, role, is_superhost)
VALUES ('user_host_uvais', 'uvais.guide@airbnb-demo.com', 'Uvais', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=350&q=80', 'host', 1)
''')

# 2. Add experiences from rec5.mp4.mp4
experiences = [
    {
        "id": "exp_delhi_1",
        "host_id": "user_host_uvais",
        "title": "Same Day Taj Mahal & Agra Fort Tour from Delhi",
        "description": "Explore Taj Mahal & Agra Fort on a guided day trip from Delhi by Car. Enjoy comfortable air-conditioned transport, priority skip-the-line monument entries, professional storytelling, and an unforgettable immersion in Mughal architecture.",
        "property_type": "Experience",
        "category": "experiences",
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "address": "Connaught Place, New Delhi, Delhi, 282001",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "price_per_night": 4500,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 10,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": True,
        "amenities": ["Transport included", "English guide", "Skip-the-line tickets", "Refreshments", "Photography assistance"],
        "images": [
            "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "exp_delhi_2",
        "host_id": "user_host_uvais",
        "title": "Old Delhi Food-Temples-Spice Market & Rickshaw",
        "description": "Step into Old Delhi's vibrant lanes via cycle rickshaw. Taste authentic street gastronomy, visit Asia's biggest spice market Khari Baoli, and discover hidden rooftop haveli views.",
        "property_type": "Experience",
        "category": "experiences",
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "address": "Chandni Chowk, Old Delhi",
        "latitude": 28.6506,
        "longitude": 77.2303,
        "price_per_night": 4500,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 8,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": True,
        "amenities": ["Food tastings", "Rickshaw ride", "Tea & snacks", "Local guide"],
        "images": [
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "exp_delhi_3",
        "host_id": "user_host_uvais",
        "title": "Old Delhi with Her Food Religion History & Culture",
        "description": "Experience Old Delhi through the eyes of a local female historian. Discover peaceful heritage courtyards, Sikh community kitchens, and traditional Mughal sweets.",
        "property_type": "Experience",
        "category": "experiences",
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "address": "Jama Masjid Gate 3, Old Delhi",
        "latitude": 28.6500,
        "longitude": 77.2330,
        "price_per_night": 2799,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 6,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": True,
        "amenities": ["Food tastings", "Sikh temple visit", "Cultural walking tour"],
        "images": [
            "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "exp_delhi_4",
        "host_id": "user_host_uvais",
        "title": "Taj Mahal & Agra Fort Tour with Local Guide",
        "description": "Personalized VIP day journey to Agra with dedicated driver and licensed historian guide. Learn stories behind the white marble monument of love.",
        "property_type": "Experience",
        "category": "experiences",
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "address": "Agra & New Delhi",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "price_per_night": 3700,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 12,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": True,
        "amenities": ["Private transport", "Monument tickets", "Bottled water"],
        "images": [
            "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "exp_delhi_5",
        "host_id": "user_host_uvais",
        "title": "Uncover Old and New Delhi with a local guide",
        "description": "Compare the British colonial elegance of New Delhi with the historic 17th-century charm of Shahjahanabad on a guided small-group adventure.",
        "property_type": "Experience",
        "category": "experiences",
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "address": "India Gate, New Delhi",
        "latitude": 28.6129,
        "longitude": 77.2295,
        "price_per_night": 1200,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 15,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": True,
        "amenities": ["Walking tour", "Historical insights", "Metro ride"],
        "images": [
            "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "exp_delhi_6",
        "host_id": "user_host_uvais",
        "title": "Old Delhi: Hidden Gems with Local's Life & Tuk-Tuk",
        "description": "Zip through narrow bazaar alleys on private tuk-tuks, sample secret local food spots, and meet century-old artisan families in the heart of Old Delhi.",
        "property_type": "Experience",
        "category": "experiences",
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "address": "Red Fort, Delhi",
        "latitude": 28.6562,
        "longitude": 77.2410,
        "price_per_night": 7999,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 4,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": True,
        "amenities": ["Private Tuk-Tuk", "Food & beverage", "Photography"],
        "images": [
            "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80"
        ]
    }
]

for exp in experiences:
    cursor.execute('''
    INSERT OR REPLACE INTO listings (
        id, host_id, title, description, property_type, category,
        city, state, country, address, latitude, longitude,
        price_per_night, cleaning_fee, service_fee_percent,
        max_guests, bedrooms, beds, bathrooms, is_guest_favourite
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        exp["id"], exp["host_id"], exp["title"], exp["description"],
        exp["property_type"], exp["category"], exp["city"], exp["state"],
        exp["country"], exp["address"], exp["latitude"], exp["longitude"],
        exp["price_per_night"], exp["cleaning_fee"], exp["service_fee_percent"],
        exp["max_guests"], exp["bedrooms"], exp["beds"], exp["bathrooms"],
        exp["is_guest_favourite"]
    ))

    cursor.execute("DELETE FROM listing_images WHERE listing_id = ?", (exp["id"],))
    for idx, url in enumerate(exp["images"]):
        cursor.execute(
            "INSERT INTO listing_images (id, listing_id, url, caption, display_order, is_cover) VALUES (?, ?, ?, ?, ?, ?)",
            (f'img_{exp["id"]}_{idx}', exp["id"], url, f'Photo {idx+1}', idx, idx == 0)
        )

# Add reviews for exp_delhi_1 (140 ratings, average 4.91)
cursor.execute("DELETE FROM reviews WHERE listing_id = 'exp_delhi_1'")
sample_revs = [
    ("user_rev_1", 5, "Cj", "Philippines", "1 day ago", "Amazing day tour to Taj Mahal and Agra Fort! Uvais was incredibly knowledgeable and helped us take the best photos."),
    ("user_rev_2", 5, "D", "Hyattsville, MD", "1 day ago", "Everything was perfectly organized. The private AC car was smooth and comfortable. Taj Mahal was breathtaking."),
    ("user_rev_1", 5, "Vishal", "Guwahati, India", "2 weeks ago", "Driver and guides were very friendly and polite. Skip the line entry saved so much time!"),
    ("user_rev_2", 5, "Sobe", "Chicago, IL", "3 weeks ago", "Our host was very patient and kept me company while my family took a ton of pictures. He was intentional and didn't pressure us.")
]

for idx, (author_id, score, name, loc, date_str, comment) in enumerate(sample_revs):
    cursor.execute('''
    INSERT OR REPLACE INTO reviews (id, listing_id, author_id, rating_overall, rating_cleanliness, rating_accuracy, rating_communication, rating_location, rating_value, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (f'rev_exp_1_{idx}', 'exp_delhi_1', author_id, score, 5, 5, 5, 5, 5, comment))

conn.commit()
conn.close()
print("Experiences seeded successfully!")
