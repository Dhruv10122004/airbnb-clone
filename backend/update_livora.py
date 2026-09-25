import sqlite3

db_path = r'c:\Users\lenovo\airbnb-clone\backend\airbnb.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Update or insert host Deeksha
cursor.execute('''
INSERT OR REPLACE INTO users (id, email, full_name, avatar_url, role, is_superhost)
VALUES ('user_host_deeksha', 'deeksha.host@airbnb-demo.com', 'Deeksha', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80', 'host', 1)
''')

# Update list_noida_2 to match rec4.mp4.mp4 exactly
cursor.execute('''
UPDATE listings 
SET title = 'The House Of Livora | A Vintage Stay in Noida',
    host_id = 'user_host_deeksha',
    description = 'The House of Livora is created for travellers who appreciate beauty beyond the ordinary. This apartment is a celebration of timeless design, refined comfort, and meaningful hospitality. From handcrafted details to elegant interiors, every space has been curated to make you feel at home while experiencing the charm of a vintage luxury retreat.',
    property_type = 'Flat',
    max_guests = 3,
    bedrooms = 1,
    beds = 1,
    bathrooms = 1
WHERE id = 'list_noida_2'
''')

# Update images
images = [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'
]

cursor.execute("DELETE FROM listing_images WHERE listing_id = 'list_noida_2'")
for idx, url in enumerate(images):
    cursor.execute(
        "INSERT INTO listing_images (id, listing_id, url, caption, display_order, is_cover) VALUES (?, ?, ?, ?, ?, ?)",
        (f'img_noida_2_{idx}', 'list_noida_2', url, f'Vintage Interior {idx+1}', idx, idx == 0)
    )

conn.commit()
conn.close()
print("Database updated successfully!")
