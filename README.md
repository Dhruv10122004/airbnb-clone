# Airbnb Clone

A full-stack Airbnb-inspired web application built with Next.js 15 on the frontend and FastAPI with SQLite on the backend. The project replicates the core user journey of the Airbnb platform: browsing property listings, searching and filtering by location and dates, viewing detailed listing pages, checking out with a mocked payment flow, managing trips, and hosting properties through a dedicated host dashboard.

---

## Table of Contents

1. [Live Features](#live-features)
2. [Mocked and Placeholder Features](#mocked-and-placeholder-features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Setup Instructions](#setup-instructions)
6. [Architecture Overview](#architecture-overview)
7. [Database Schema](#database-schema)
8. [API Reference](#api-reference)

---

## Live Features

- Browse property listings across categories: Popular, Farms, Luxury, Beachfront, Cabins, Trending
- Search by location, dates, and guest count using an Airbnb-style search capsule
- Filter listings by price range, property type, amenities, and capacity
- View full listing detail pages with photo galleries, amenities, host info, and guest reviews
- Date availability calendar that blocks out already-booked dates in real time
- Mocked checkout flow with Card, UPI, and Net Banking payment tabs
- My Trips page to view confirmed and cancelled bookings
- Wishlist toggle with per-user persistence
- Host dashboard to manage listings and view incoming reservations and earnings
- Guest vs Host role distinction with demo profile switcher
- Experiences and Services browsing with dedicated detail views
- Navbar search, currency selector, and category navigation bar
- Static OpenStreetMap embedded on listing detail pages

---

## Mocked and Placeholder Features

The following features are intentionally mocked or stubbed for the purposes of this demo. Each has a visible "Coming Soon" notice in the UI.

| Feature | Current State | Location |
|---|---|---|
| Real payment processing | Payment is fully mocked. No charge is made. Booking is confirmed and dates are blocked. | Checkout modal, amber banner at top |
| Guest-to-host messaging | No real-time messaging. A "Coming Soon" notice replaces the message form. | Listing detail page, Services detail page |
| Live pricing pins on map | A static OpenStreetMap iframe is shown. Price pins are not rendered. | Listing detail page, map section |
| Identity verification | Not implemented. A placeholder card documents the planned Onfido / DigiLocker integration. | My Trips page, "Coming Soon" section |
| Real OAuth / SMS authentication | No real OAuth. A demo profile switcher lets testers switch between pre-seeded guest and host accounts. | Auth modal, My Trips page |

---

## Tech Stack

### Frontend

- Framework: Next.js 15 with the App Router and React 19
- Styling: Tailwind CSS v4
- Language: TypeScript
- Icons: Lucide React
- Build tool: Turbopack

### Backend

- Framework: FastAPI (Python 3.11+)
- Database: SQLite via SQLAlchemy ORM
- Server: Uvicorn (ASGI)
- Data seeding: Custom seed_data.py script runs on startup

---

## Project Structure

`
airbnb-clone/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point, CORS, router registration
│   │   ├── database.py        # SQLAlchemy engine, session, and Base setup
│   │   ├── models.py          # ORM models: User, Listing, Booking, Review, Wishlist
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   ├── seed_data.py       # Demo data seeder (runs automatically on first startup)
│   │   └── routers/
│   │       ├── auth.py        # Login, register, current user, demo user list
│   │       ├── listings.py    # Listings CRUD, search, filter, availability
│   │       ├── bookings.py    # Create booking, list user trips, cancel booking
│   │       ├── host.py        # Host listings, reservations, earnings stats
│   │       ├── reviews.py     # Add and retrieve listing reviews
│   │       └── wishlists.py   # Toggle wishlist, get saved listings
│   ├── airbnb.db              # SQLite database file (auto-created on first run)
│   ├── requirements.txt
│   └── venv/
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx              # Home page: listing grid, nav tabs, section headers
    │   │   ├── layout.tsx            # Root layout with font and metadata
    │   │   ├── globals.css           # Global styles and Tailwind directives
    │   │   ├── rooms/[id]/page.tsx   # Listing detail page
    │   │   ├── services/[id]/page.tsx # Services detail page
    │   │   ├── trips/page.tsx        # My Trips and Coming Soon placeholders
    │   │   ├── wishlists/page.tsx    # Saved listings page
    │   │   └── host/page.tsx         # Host dashboard
    │   ├── components/
    │   │   ├── Navbar.tsx            # Top navigation bar
    │   │   ├── SearchCapsule.tsx     # Location/dates/guests search modal
    │   │   ├── ListingCard.tsx       # Reusable listing card with wishlist toggle
    │   │   ├── CheckoutModal.tsx     # Multi-step mocked checkout flow
    │   │   ├── AuthModal.tsx         # Login/signup modal with demo profile switcher
    │   │   ├── FilterModal.tsx       # Price, property type, amenity filters
    │   │   ├── CategoryBar.tsx       # Icon navigation bar (All, Homes, Experiences, Services)
    │   │   ├── ServiceDetailView.tsx # Full-page detail view for service listings
    │   │   ├── AirbnbLogo.tsx        # SVG logo component
    │   │   ├── CurrencyModal.tsx     # Currency switcher UI
    │   │   ├── Footer.tsx            # Site footer
    │   │   └── PromoModal.tsx        # Promotional popover
    │   ├── lib/
    │   │   └── api.ts                # All fetch calls to the backend REST API
    │   └── types/
    │       └── index.ts              # TypeScript type definitions matching API schemas
    ├── package.json
    ├── tailwind.config.ts
    └── next.config.ts
`

---

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- Python 3.11 or higher
- Git

### 1. Clone the repository

`ash
git clone https://github.com/Dhruv10122004/airbnb-clone.git
cd airbnb-clone
`

### 2. Backend setup

`ash
cd backend

# Create and activate a virtual environment
python -m venv venv

# On Windows:
.\venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the development server (auto-seeds data on first run)
uvicorn app.main:app --reload --port 8000
`

The API will be available at http://localhost:8000.
Interactive API documentation (Swagger UI) is at http://localhost:8000/docs.

The SQLite database file airbnb.db is created automatically in the backend/ directory on first startup. The seed script populates demo users, listings, images, and reviews. You do not need to run any migration commands.

### 3. Frontend setup

Open a second terminal:

`ash
cd frontend

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
`

The application will be available at http://localhost:3000.

### 4. Environment

No .env file is required for local development. The frontend is hardcoded to call http://localhost:8000 in development mode via next.config.ts. The backend uses SQLite with no external database connection.

### 5. Demo accounts

On first startup the backend seeds the following demo accounts. Use the "Use a demo profile" option in the login modal to switch between them.

| Name | Role | Notes |
|---|---|---|
| Priya Sharma | host | Superhost with multiple listings |
| Rahul Mehta | host | Standard host |
| Ananya Iyer | guest | Primary guest account |
| Deeksha Rao | guest | Secondary guest account |

---

## Architecture Overview

`
Browser (Next.js 15, React 19, Tailwind CSS)
     |
     |  HTTP REST  (JSON)
     v
FastAPI backend  (Uvicorn ASGI server, port 8000)
     |
     |  SQLAlchemy ORM
     v
SQLite database  (backend/airbnb.db)
`

### Request flow

1. The user performs an action in the browser (search, book, wishlist, etc.).
2. The Next.js frontend calls a function in lib/api.ts, which sends an HTTP request to the FastAPI backend.
3. The relevant FastAPI router validates the request using a Pydantic schema, optionally authenticates the caller via the X-User-Id header, and queries or mutates the SQLite database.
4. The router returns a JSON response, which the frontend renders.

### Authentication model

Authentication is simplified for demo purposes. There are no passwords, JWTs, or sessions. The frontend stores the selected user UUID in localStorage under the key airbnb_user_id and sends it as the X-User-Id header on every request. The backend reads this header to identify the current user. If the header is absent or invalid, the API falls back to the first seeded guest account so that the app remains fully browsable without logging in.

### Guest vs Host distinction

The users table has a role column with two possible values: "guest" and "host". The host dashboard at /host is only functional for accounts with role = "host". The frontend reads the role field from the current user object and conditionally renders host-specific UI elements such as the host dashboard link in the navbar.

---

## Database Schema

All primary keys are UUIDs stored as strings. Foreign key constraints are enforced using SQLite PRAGMA foreign_keys = ON.

### users

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | String | PK | UUID |
| email | String | Unique, Not Null | User email address |
| full_name | String | Not Null | Display name |
| avatar_url | String | Nullable | Profile photo URL |
| role | String | Default: guest | "guest" or "host" |
| is_superhost | Boolean | Default: False | Superhost badge flag |
| created_at | DateTime | Default: now | Record creation timestamp |

### listings

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | String | PK | UUID |
| host_id | String | FK -> users.id | Owning host |
| title | String | Not Null | Listing headline |
| description | Text | Not Null | Full description |
| property_type | String | Not Null | Flat, Villa, Cabin, Loft, Farm stay |
| category | String | Not Null, Indexed | popular, farms, luxury, beachfront, cabins, trending |
| city | String | Not Null, Indexed | City name |
| state | String | Nullable | State or province |
| country | String | Default: India | Country |
| address | String | Nullable | Full address string |
| latitude | Float | Nullable | GPS latitude |
| longitude | Float | Nullable | GPS longitude |
| price_per_night | Integer | Not Null | Price in INR |
| cleaning_fee | Integer | Default: 500 | Flat cleaning fee in INR |
| service_fee_percent | Integer | Default: 12 | Percentage applied to base price |
| max_guests | Integer | Default: 2 | Maximum guest capacity |
| bedrooms | Integer | Default: 1 | Number of bedrooms |
| beds | Integer | Default: 1 | Number of beds |
| bathrooms | Integer | Default: 1 | Number of bathrooms |
| amenities | JSON | Default: [] | Array of amenity strings |
| is_guest_favourite | Boolean | Default: True | Guest Favourite badge |
| created_at | DateTime | Default: now | Record creation timestamp |
| updated_at | DateTime | Default: now | Last updated timestamp |

### listing_images

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | String | PK | UUID |
| listing_id | String | FK -> listings.id | Parent listing |
| url | String | Not Null | Image URL |
| caption | String | Nullable | Alt text or caption |
| display_order | Integer | Default: 0 | Sort order for gallery |
| is_cover | Boolean | Default: False | Whether this is the cover photo |

### bookings

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | String | PK | UUID |
| listing_id | String | FK -> listings.id | Booked listing |
| guest_id | String | FK -> users.id | Guest who booked |
| check_in | Date | Not Null | Check-in date |
| check_out | Date | Not Null | Check-out date |
| total_nights | Integer | Not Null | Computed number of nights |
| guest_count | Integer | Default: 1 | Number of guests |
| base_price | Integer | Not Null | price_per_night multiplied by nights |
| cleaning_fee | Integer | Default: 0 | Cleaning fee at time of booking |
| service_fee | Integer | Default: 0 | Service fee at time of booking |
| total_price | Integer | Not Null | Sum of all fees |
| status | String | Default: confirmed | "confirmed" or "cancelled" |
| created_at | DateTime | Default: now | Record creation timestamp |

### reviews

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | String | PK | UUID |
| listing_id | String | FK -> listings.id | Reviewed listing |
| author_id | String | FK -> users.id | Reviewer |
| rating_overall | Float | Not Null | Overall rating, 1 to 5 |
| rating_cleanliness | Integer | Default: 5 | Cleanliness sub-rating |
| rating_accuracy | Integer | Default: 5 | Accuracy sub-rating |
| rating_communication | Integer | Default: 5 | Communication sub-rating |
| rating_location | Integer | Default: 5 | Location sub-rating |
| rating_value | Integer | Default: 5 | Value sub-rating |
| comment | Text | Not Null | Review text |
| created_at | DateTime | Default: now | Record creation timestamp |

### wishlists

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | String | PK | UUID |
| user_id | String | FK -> users.id | Saving user |
| listing_id | String | FK -> listings.id | Saved listing |
| created_at | DateTime | Default: now | Record creation timestamp |

A unique constraint on (user_id, listing_id) prevents duplicate saves.

### Entity relationships

`
users
  |-- (host_id)  listings
  |                 |-- (listing_id)  listing_images
  |                 |-- (listing_id)  bookings
  |                 |-- (listing_id)  reviews
  |                 |-- (listing_id)  wishlists
  |
  |-- (guest_id)  bookings
  |-- (author_id) reviews
  |-- (user_id)   wishlists
`

---

## API Reference

Base URL: http://localhost:8000
Interactive Swagger docs: http://localhost:8000/docs

All authenticated endpoints read the X-User-Id request header. If the header is absent, the API defaults to the first seeded guest account.

---

### Auth

#### GET /api/auth/me

Returns the profile of the currently authenticated user.

Response: UserResponse

---

#### GET /api/auth/users

Returns all pre-seeded demo user accounts for the profile switcher.

Response: UserResponse[]

---

#### POST /api/auth/login

Logs in by email address. Creates a new guest account if the email does not exist.

Body:
`json
{ "email": "user@example.com" }
`

Response: UserResponse

---

#### POST /api/auth/register

Creates a new user account explicitly.

Body:
`json
{
  "email": "user@example.com",
  "full_name": "Jane Doe",
  "role": "guest",
  "is_superhost": false
}
`

Response: UserResponse

---

### Listings

#### GET /api/listings

Returns a paginated list of listing summaries. Supports search and filter parameters.

Query parameters:

| Parameter | Type | Description |
|---|---|---|
| category | string | Filter by category: popular, farms, luxury, beachfront, cabins, trending |
| destination | string | Free-text location search across city, state, address |
| min_price | int | Minimum price per night in INR |
| max_price | int | Maximum price per night in INR |
| property_type | string | Filter by property type |
| guests | int | Minimum guest capacity |
| amenities | string | Comma-separated amenity names |
| check_in | date | YYYY-MM-DD. Excludes listings with overlapping bookings |
| check_out | date | YYYY-MM-DD. Excludes listings with overlapping bookings |
| limit | int | Page size, default 50, max 100 |
| offset | int | Pagination offset, default 0 |

Response: ListingSummary[]

---

#### GET /api/listings/{id}

Returns full detail for a single listing including images, host profile, reviews, and sub-ratings.

Response: ListingDetail

---

#### GET /api/listings/{id}/booked-dates

Returns all confirmed date ranges for a listing. Used by the frontend calendar to block unavailable dates.

Response:
`json
[{ "check_in": "2026-10-01", "check_out": "2026-10-05" }]
`

---

#### POST /api/listings

Creates a new listing. Requires a host account.

Body: ListingCreate

Response: ListingDetail

---

#### PUT /api/listings/{id}

Updates an existing listing. Only the owning host can update.

Body: ListingUpdate (all fields optional)

Response: ListingDetail

---

#### DELETE /api/listings/{id}

Deletes a listing and all related images, bookings, reviews, and wishlist entries via cascade.

Response: { "ok": true }

---

### Bookings

#### POST /api/bookings

Creates a new booking. Validates date availability, guest capacity, and price breakdown server-side.

Body:
`json
{
  "listing_id": "uuid",
  "check_in": "2026-10-15",
  "check_out": "2026-10-18",
  "guest_count": 2
}
`

Response: BookingResponse

---

#### GET /api/bookings/my-trips

Returns all bookings made by the authenticated user.

Response: BookingResponse[]

---

#### DELETE /api/bookings/{id}

Cancels a booking by setting its status to "cancelled". Blocked dates are released immediately.

Response: BookingResponse

---

### Host

#### GET /api/host/listings

Returns all listings owned by the authenticated host.

Response: ListingSummary[]

---

#### GET /api/host/reservations

Returns all bookings for any listing owned by the authenticated host.

Response: BookingResponse[]

---

#### GET /api/host/stats

Returns aggregate statistics for the authenticated host.

Response:
`json
{
  "total_listings": 4,
  "total_reservations": 12,
  "total_earnings": 248000,
  "is_superhost": true
}
`

---

### Reviews

#### POST /api/reviews/{listing_id}

Adds a review for a listing.

Body:
`json
{
  "rating_overall": 4.8,
  "rating_cleanliness": 5,
  "rating_accuracy": 5,
  "rating_communication": 5,
  "rating_location": 4,
  "rating_value": 5,
  "comment": "Wonderful stay."
}
`

Response: ReviewResponse

---

#### GET /api/reviews/{listing_id}

Returns all reviews for a listing, ordered by most recent.

Response: ReviewResponse[]

---

### Wishlists

#### POST /api/wishlists/toggle

Adds a listing to the wishlist if not already saved, or removes it if it is. Acts as a toggle.

Body:
`json
{ "listing_id": "uuid" }
`

Response:
`json
{ "listing_id": "uuid", "is_saved": true }
`

---

#### GET /api/wishlists

Returns full listing summaries for all listings in the authenticated user's wishlist.

Response: ListingSummary[]

---

#### GET /api/wishlists/ids

Returns only the listing IDs saved to the user's wishlist. Used by the frontend to render wishlist heart icons without fetching full listing data.

Response: string[]
