import sqlite3
conn = sqlite3.connect('backend/airbnb.db')
conn.execute("UPDATE reviews SET created_at = datetime('now') WHERE created_at IS NULL")
conn.commit()
conn.close()
print("Reviews timestamps updated!")
