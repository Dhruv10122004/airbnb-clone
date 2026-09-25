export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: "guest" | "host";
  is_superhost: boolean;
  created_at?: string;
}

export interface ListingSummary {
  id: string;
  title: string;
  property_type: string;
  category: string;
  city: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  price_per_night: number;
  is_guest_favourite: boolean;
  cover_image: string;
  images: string[];
  average_rating: number;
  review_count: number;
}

export interface ListingImage {
  id: string;
  url: string;
  caption?: string;
  display_order: number;
  is_cover: boolean;
}

export interface Review {
  id: string;
  rating_overall: number;
  rating_cleanliness: number;
  rating_accuracy: number;
  rating_communication: number;
  rating_location: number;
  rating_value: number;
  comment: string;
  created_at: string;
  author: User;
}

export interface BookedDateRange {
  check_in: string;
  check_out: string;
}

export interface ListingDetail {
  id: string;
  title: string;
  description: string;
  property_type: string;
  category: string;
  city: string;
  state?: string;
  country: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  price_per_night: number;
  cleaning_fee: number;
  service_fee_percent: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  is_guest_favourite: boolean;
  host: User;
  images: ListingImage[];
  reviews: Review[];
  average_rating: number;
  review_count: number;
  booked_dates: BookedDateRange[];
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  listing_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  total_nights: number;
  guest_count: number;
  base_price: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: "confirmed" | "cancelled";
  created_at: string;
  listing: ListingSummary;
}

export interface HostStats {
  total_listings: number;
  total_reservations: number;
  total_earnings: number;
  is_superhost: boolean;
}
