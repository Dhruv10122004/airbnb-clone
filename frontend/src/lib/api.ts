import {
  ListingSummary,
  ListingDetail,
  Booking,
  User,
  HostStats,
  Review,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const activeUserId = localStorage.getItem("airbnb_user_id");
    if (activeUserId) {
      headers["x-user-id"] = activeUserId;
    }
  }
  return headers;
}

export async function fetchListings(params?: {
  category?: string;
  destination?: string;
  min_price?: number;
  max_price?: number;
  property_type?: string;
  guests?: number;
  check_in?: string;
  check_out?: string;
  amenities?: string;
}): Promise<ListingSummary[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "all") query.set("category", params.category);
  if (params?.destination) query.set("destination", params.destination);
  if (params?.min_price) query.set("min_price", params.min_price.toString());
  if (params?.max_price) query.set("max_price", params.max_price.toString());
  if (params?.property_type && params.property_type !== "all") query.set("property_type", params.property_type);
  if (params?.guests) query.set("guests", params.guests.toString());
  if (params?.check_in) query.set("check_in", params.check_in);
  if (params?.check_out) query.set("check_out", params.check_out);
  if (params?.amenities) query.set("amenities", params.amenities);

  const res = await fetch(`${API_BASE}/api/listings?${query.toString()}`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch listings");
  return res.json();
}

export async function fetchListingById(id: string): Promise<ListingDetail> {
  const res = await fetch(`${API_BASE}/api/listings/${id}`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch listing detail");
  return res.json();
}

export async function createBooking(data: {
  listing_id: string;
  check_in: string;
  check_out: string;
  guest_count: number;
}): Promise<Booking> {
  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Booking failed");
  }
  return res.json();
}

export async function fetchMyTrips(): Promise<Booking[]> {
  const res = await fetch(`${API_BASE}/api/bookings/my-trips`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch trips");
  return res.json();
}

export async function cancelBooking(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to cancel booking");
  return res.json();
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function fetchDemoUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/api/auth/users`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch demo users");
  return res.json();
}

export async function loginUser(email: string, full_name?: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, full_name }),
  });
  if (!res.ok) throw new Error("Failed to log in");
  const user = await res.json();
  if (typeof window !== "undefined") {
    localStorage.setItem("airbnb_user_id", user.id);
  }
  return user;
}

export async function toggleWishlist(listing_id: string): Promise<{ is_saved: boolean }> {
  const res = await fetch(`${API_BASE}/api/wishlists/toggle`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ listing_id }),
  });
  if (!res.ok) throw new Error("Failed to toggle wishlist");
  return res.json();
}

export async function fetchWishlistIds(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/wishlists/ids`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchWishlistListings(): Promise<ListingSummary[]> {
  const res = await fetch(`${API_BASE}/api/wishlists`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchHostStats(): Promise<HostStats> {
  const res = await fetch(`${API_BASE}/api/host/stats`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch host stats");
  return res.json();
}

export async function fetchHostListings(): Promise<ListingSummary[]> {
  const res = await fetch(`${API_BASE}/api/host/listings`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch host listings");
  return res.json();
}

export async function fetchHostReservations(): Promise<Booking[]> {
  const res = await fetch(`${API_BASE}/api/host/reservations`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch host reservations");
  return res.json();
}

export async function createHostListing(data: any): Promise<ListingDetail> {
  const res = await fetch(`${API_BASE}/api/listings`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create listing");
  }
  return res.json();
}

export async function deleteHostListing(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/listings/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete listing");
  return res.json();
}

export async function addReview(listingId: string, review: {
  rating_overall: number;
  comment: string;
}): Promise<Review> {
  const res = await fetch(`${API_BASE}/api/reviews/${listingId}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      ...review,
      rating_cleanliness: 5,
      rating_accuracy: 5,
      rating_communication: 5,
      rating_location: 5,
      rating_value: 5,
    }),
  });
  if (!res.ok) throw new Error("Failed to submit review");
  return res.json();
}
