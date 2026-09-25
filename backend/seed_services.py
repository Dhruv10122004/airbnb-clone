import sqlite3
import json
from datetime import datetime, timezone

db_path = r'c:\Users\lenovo\airbnb-clone\backend\airbnb.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Insert service hosts
hosts = [
    {
        "id": "user_host_deepak",
        "email": "deepak.hairstylist@airbnb-demo.com",
        "full_name": "Deepak Kumar Mohanty",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        "role": "host",
        "is_superhost": 1
    },
    {
        "id": "user_host_govind",
        "email": "govind.hair@airbnb-demo.com",
        "full_name": "Govind Sharma",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        "role": "host",
        "is_superhost": 1
    },
    {
        "id": "user_host_nidhi",
        "email": "nidhi.hair@airbnb-demo.com",
        "full_name": "Nidhi Verma",
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        "role": "host",
        "is_superhost": 1
    },
    {
        "id": "user_host_shreya",
        "email": "shreya.photo@airbnb-demo.com",
        "full_name": "Shreya Sen",
        "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
        "role": "host",
        "is_superhost": 1
    },
    {
        "id": "user_host_mayank",
        "email": "mayank.fitness@airbnb-demo.com",
        "full_name": "Mayank Fitness",
        "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
        "role": "host",
        "is_superhost": 1
    }
]

for h in hosts:
    cursor.execute('''
    INSERT OR REPLACE INTO users (id, email, full_name, avatar_url, role, is_superhost, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (h["id"], h["email"], h["full_name"], h["avatar_url"], h["role"], h["is_superhost"], datetime.now(timezone.utc).isoformat()))

# 2. Services from rec6.mp4.mp4
services = [
    # --- HAIR SERVICES ---
    {
        "id": "srv_hair_deepak",
        "host_id": "user_host_deepak",
        "title": "Deepak mohanty hairstylist",
        "description": "film, advertising , bridel , party hair and model hairstyling by deepak creative hairstylist. Specialized in custom bridal looks, editorial shoots, red carpet events, and in-home luxury hair styling.",
        "property_type": "Service",
        "category": "services",
        "city": "NOIDA",
        "state": "Uttar Pradesh",
        "country": "India",
        "address": "Sector 50, NOIDA, Uttar Pradesh",
        "latitude": 28.5700,
        "longitude": 77.3600,
        "price_per_night": 2000,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 5,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": True,
        "amenities": json.dumps(["In home styling", "Blow-drys", "Up-dos", "Bridal hair", "Professional tools provided", "Hair extensions setup"]),
        "images": [
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "6436959",
        "host_id": "user_host_deepak",
        "title": "Deepak mohanty hairstylist",
        "description": "film, advertising , bridel , party hair and model hairstyling by deepak creative hairstylist. Specialized in custom bridal looks, editorial shoots, red carpet events, and in-home luxury hair styling.",
        "property_type": "Service",
        "category": "services",
        "city": "NOIDA",
        "state": "Uttar Pradesh",
        "country": "India",
        "address": "Sector 50, NOIDA, Uttar Pradesh",
        "latitude": 28.5700,
        "longitude": 77.3600,
        "price_per_night": 2000,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 5,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": True,
        "amenities": json.dumps(["In home styling", "Blow-drys", "Up-dos", "Bridal hair", "Professional tools provided", "Hair extensions setup"]),
        "images": [
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "srv_hair_govind",
        "host_id": "user_host_govind",
        "title": "Runway ready hair looks by Govind",
        "description": "In home · Blow-drys, dry styling and more. High-fashion hairstyling, heat protectant treatments, and sleek looks designed for your face shape.",
        "property_type": "Service",
        "category": "services",
        "city": "Gurugram",
        "state": "Haryana",
        "country": "India",
        "address": "DLF Phase 4, Gurugram, Haryana",
        "latitude": 28.4595,
        "longitude": 77.0266,
        "price_per_night": 1299,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 4,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": False,
        "amenities": json.dumps(["In home", "Blow-drys", "Dry styling", "Iron curls"]),
        "images": [
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "srv_hair_nidhi",
        "host_id": "user_host_nidhi",
        "title": "Elegant event hairstyles by Nidhi",
        "description": "In home · Dry styling. Elegant curls, sleek blowouts, and party styling for weddings, receptions, and festivals. Minimum ₹3,000 to book.",
        "property_type": "Service",
        "category": "services",
        "city": "Gurugram",
        "state": "Haryana",
        "country": "India",
        "address": "Golf Course Road, Gurugram, Haryana",
        "latitude": 28.4600,
        "longitude": 77.0300,
        "price_per_night": 1700,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 4,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": False,
        "amenities": json.dumps(["In home", "Dry styling", "Minimum ₹3,000 to book"]),
        "images": [
            "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "srv_hair_salon",
        "host_id": "user_host_deepak",
        "title": "Elegant event hairstyles by Salon At Door",
        "description": "In home · Up-dos. Professional event hairstyling brought to your home door by vetted luxury salon experts.",
        "property_type": "Service",
        "category": "services",
        "city": "NOIDA",
        "state": "Uttar Pradesh",
        "country": "India",
        "address": "Sector 62, NOIDA, Uttar Pradesh",
        "latitude": 28.6200,
        "longitude": 77.3600,
        "price_per_night": 1302,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 6,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": False,
        "amenities": json.dumps(["In home", "Up-dos", "Fast setup"]),
        "images": [
            "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80"
        ]
    },

    # --- PHOTOGRAPHY SERVICES ---
    {
        "id": "srv_photo_1",
        "host_id": "user_host_shreya",
        "title": "New Delhi photo session by a Female Photographer",
        "description": "Capturing genuine love stories, portraits, and vacation memories at Humayun's Tomb, Lodhi Art District, and Delhi heritage monuments. 50+ color-corrected high-res photos included.",
        "property_type": "Service",
        "category": "services",
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "address": "Humayun Tomb, Nizamuddin East, New Delhi",
        "latitude": 28.5933,
        "longitude": 77.2507,
        "price_per_night": 8500,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 4,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": True,
        "amenities": json.dumps(["Popular", "50+ HD Edits", "Props included", "Heritage site entry advice"]),
        "images": [
            "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "srv_photo_2",
        "host_id": "user_host_shreya",
        "title": "Candid travel portraits by Anurag",
        "description": "Candid natural light street portraits around Old Delhi, Connaught Place, and Hauz Khas. Masterful framing and relaxed vibes.",
        "property_type": "Service",
        "category": "services",
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "address": "Connaught Place, New Delhi",
        "latitude": 28.6304,
        "longitude": 77.2177,
        "price_per_night": 8000,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 3,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": True,
        "amenities": json.dumps(["Candid photography", "Fast 2-day delivery", "Travel tips"]),
        "images": [
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "srv_photo_3",
        "host_id": "user_host_shreya",
        "title": "Story filled portraits by Rohit",
        "description": "Cinematic portraits capturing architecture, soul, and candid expressions against Delhi's historical arches.",
        "property_type": "Service",
        "category": "services",
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "address": "Lodhi Garden, New Delhi",
        "latitude": 28.5931,
        "longitude": 77.2197,
        "price_per_night": 7000,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 4,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": True,
        "amenities": json.dumps(["Story portraits", "High resolution", "Outfit changes"]),
        "images": [
            "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "srv_photo_4",
        "host_id": "user_host_shreya",
        "title": "Artful city portraits by Ashish",
        "description": "Group and couple portraits with bespoke color grading and fast turnaround at architectural gems.",
        "property_type": "Service",
        "category": "services",
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "address": "Agrasen Ki Baoli, New Delhi",
        "latitude": 28.6258,
        "longitude": 77.2250,
        "price_per_night": 9500,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 6,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": False,
        "amenities": json.dumps(["Per group pricing", "Drone shots available", "Color graded"]),
        "images": [
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "srv_photo_5",
        "host_id": "user_host_shreya",
        "title": "Fine visual art by Moneesha",
        "description": "Fine art landscape and portraiture sessions with golden hour lighting, tailored styling, and intimate atmosphere.",
        "property_type": "Service",
        "category": "services",
        "city": "Gurugram",
        "state": "Haryana",
        "country": "India",
        "address": "Leisure Valley Park, Gurugram",
        "latitude": 28.4682,
        "longitude": 77.0620,
        "price_per_night": 4800,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 2,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": False,
        "amenities": json.dumps(["Fine visual art", "Sunset sessions", "Artistic retouches"]),
        "images": [
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "srv_photo_6",
        "host_id": "user_host_shreya",
        "title": "Stunning Corporate Portraits by Vishal Diwan",
        "description": "Studio lighting brought to your office or home for executive headshots, personal branding, and LinkedIn profiles.",
        "property_type": "Service",
        "category": "services",
        "city": "Gurugram",
        "state": "Haryana",
        "country": "India",
        "address": "Cyber City, Gurugram, Haryana",
        "latitude": 28.4900,
        "longitude": 77.0900,
        "price_per_night": 4000,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 1,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": False,
        "amenities": json.dumps(["Corporate studio", "Mobile strobe lights", "LinkedIn ready"]),
        "images": [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
        ]
    },

    # --- TRAINING SERVICES ---
    {
        "id": "srv_train_1",
        "host_id": "user_host_mayank",
        "title": "Strength and mobility sessions by Mayank",
        "description": "Personal functional strength training, posture correction, and mobility drills at your home or local park. Minimum ₹1,800 to book.",
        "property_type": "Service",
        "category": "services",
        "city": "Gurugram",
        "state": "Haryana",
        "country": "India",
        "address": "Sector 43, Gurugram, Haryana",
        "latitude": 28.4550,
        "longitude": 77.0850,
        "price_per_night": 1800,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 3,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": True,
        "amenities": json.dumps(["In home training", "Kettlebell training", "Posture correction", "Nutrition guidance"]),
        "images": [
            "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "srv_train_2",
        "host_id": "user_host_mayank",
        "title": "Yoga Flow & Alignment by Priya",
        "description": "Vinyasa and Hatha yoga sessions for flexibility, mindfulness, and breathing techniques tailored to all skill levels.",
        "property_type": "Service",
        "category": "services",
        "city": "Gurugram",
        "state": "Haryana",
        "country": "India",
        "address": "Sushant Lok, Gurugram, Haryana",
        "latitude": 28.4600,
        "longitude": 77.0700,
        "price_per_night": 1500,
        "cleaning_fee": 0,
        "service_fee_percent": 10,
        "max_guests": 5,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "is_guest_favourite": False,
        "amenities": json.dumps(["Mats provided", "Pranayama", "Sound bath"]),
        "images": [
            "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80"
        ]
    }
]

for s in services:
    cursor.execute('''
    INSERT OR REPLACE INTO listings (
        id, host_id, title, description, property_type, category,
        city, state, country, address, latitude, longitude,
        price_per_night, cleaning_fee, service_fee_percent,
        max_guests, bedrooms, beds, bathrooms, amenities, is_guest_favourite,
        created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        s["id"], s["host_id"], s["title"], s["description"], s["property_type"], s["category"],
        s["city"], s["state"], s["country"], s["address"], s["latitude"], s["longitude"],
        s["price_per_night"], s["cleaning_fee"], s["service_fee_percent"],
        s["max_guests"], s["bedrooms"], s["beds"], s["bathrooms"], s["amenities"], s["is_guest_favourite"],
        datetime.now(timezone.utc).isoformat(), datetime.now(timezone.utc).isoformat()
    ))

    # Add images
    cursor.execute('DELETE FROM listing_images WHERE listing_id = ?', (s["id"],))
    for idx, img_url in enumerate(s["images"]):
        cursor.execute('''
        INSERT INTO listing_images (id, listing_id, url, caption, display_order, is_cover)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (f"{s['id']}_img_{idx}", s["id"], img_url, s["title"], idx, 1 if idx == 0 else 0))

conn.commit()
conn.close()
print("Services seeded successfully!")
