from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import auth, listings, bookings, host, reviews, wishlists
from .seed_data import seed_database

# Initialize SQLite tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Airbnb Clone API",
    description="Clean, modular REST API for Airbnb Web App Clone",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for easy development and local preview
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(host.router)
app.include_router(reviews.router)
app.include_router(wishlists.router)

@app.on_event("startup")
def on_startup():
    # Automatically seed sample properties, users, and bookings if fresh DB
    seed_database()

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Airbnb Clone API",
        "documentation": "/docs"
    }
