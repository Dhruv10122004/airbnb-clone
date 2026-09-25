"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { ListingDetail, User } from "@/types";
import {
  fetchListingById,
  createBooking,
  fetchCurrentUser,
  toggleWishlist,
  addReview,
} from "@/lib/api";
import {
  Star,
  Share,
  Heart,
  Grid,
  ShieldCheck,
  Award,
  Wifi,
  Car,
  Tv,
  Utensils,
  Wind,
  Waves,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Widget State
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Modals & Gallery
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [detail, user] = await Promise.all([
        fetchListingById(id),
        fetchCurrentUser().catch(() => null),
      ]);
      setListing(detail);
      setCurrentUser(user);

      // Pre-fill dates for convenient test booking (tomorrow for 3 nights)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const after3Days = new Date();
      after3Days.setDate(after3Days.getDate() + 4);

      setCheckIn(tomorrow.toISOString().split("T")[0]);
      setCheckOut(after3Days.toISOString().split("T")[0]);
    } catch (err: any) {
      setError(err.message || "Failed to load listing details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleToggleWishlist = async () => {
    if (!listing) return;
    try {
      const res = await toggleWishlist(listing.id);
      setIsWishlisted(res.is_saved);
    } catch (err) {
      console.error(err);
    }
  };

  // Financial Calculations
  const calculateTotals = () => {
    if (!listing || !checkIn || !checkOut) return null;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    if (diffTime <= 0) return null;

    const basePrice = nights * listing.price_per_night;
    const cleaningFee = listing.cleaning_fee || 0;
    const serviceFee = Math.round(basePrice * (listing.service_fee_percent / 100));
    const total = basePrice + cleaningFee + serviceFee;

    return { nights, basePrice, cleaningFee, serviceFee, total };
  };

  const totals = calculateTotals();

  // Booking Execution
  const handleReserve = async () => {
    if (!listing || !totals) return;
    setBookingLoading(true);
    setBookingError(null);
    try {
      const res = await createBooking({
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guest_count: guestCount,
      });
      setConfirmedBooking(res);
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      setBookingError(err.message || "Booking reservation failed");
    } finally {
      setBookingLoading(false);
    }
  };

  // Review Submission
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await addReview(id, {
        rating_overall: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewComment("");
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar onOpenAuthModal={() => setIsAuthOpen(true)} currentUser={currentUser} onLogout={() => {}} />
        <div className="max-w-[1280px] mx-auto px-6 py-10 w-full animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded-lg w-2/3" />
          <div className="h-4 bg-neutral-200 rounded-lg w-1/3" />
          <div className="aspect-[2/1] bg-neutral-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar onOpenAuthModal={() => setIsAuthOpen(true)} currentUser={currentUser} onLogout={() => {}} />
        <div className="max-w-md mx-auto py-24 text-center">
          <h2 className="text-xl font-bold text-red-500">Listing Not Found</h2>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
          <Link href="/" className="inline-block mt-4 px-6 py-2 bg-black text-white rounded-full text-sm font-semibold">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const images = listing.images?.length ? listing.images.map((img) => img.url) : [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Navbar */}
      <Navbar
        onOpenAuthModal={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        onLogout={() => {
          localStorage.removeItem("airbnb_user_id");
          setCurrentUser(null);
          loadData();
        }}
      />

      <main className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16 py-6 w-full">
        {/* Title & Action Header */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] tracking-tight">
            {listing.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-[#222222]">
              <span className="flex items-center gap-1 font-semibold">
                <Star className="w-4 h-4 fill-black text-black" />
                {listing.average_rating ? listing.average_rating.toFixed(2) : "5.0"}
              </span>
              <span>·</span>
              <span className="font-semibold underline cursor-pointer">
                {listing.review_count} {listing.review_count === 1 ? "review" : "reviews"}
              </span>
              <span>·</span>
              {listing.host?.is_superhost && (
                <>
                  <span className="text-[#717171]">★ Superhost</span>
                  <span>·</span>
                </>
              )}
              <span className="text-[#717171] underline cursor-pointer">
                {listing.city}, {listing.state ? `${listing.state}, ` : ""}{listing.country}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Listing link copied to clipboard!");
                }}
                className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-slate-100 text-sm font-semibold text-[#222222] transition"
              >
                <Share className="w-4 h-4" />
                <span className="underline">Share</span>
              </button>
              <button
                onClick={handleToggleWishlist}
                className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-slate-100 text-sm font-semibold text-[#222222] transition"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? "fill-[#FF385C] text-[#FF385C]" : "text-[#222222]"
                  }`}
                />
                <span className="underline">{isWishlisted ? "Saved" : "Save"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Authentic 5-Photo Bento Grid */}
        <div className="relative rounded-2xl overflow-hidden mb-8 grid grid-cols-1 md:grid-cols-4 gap-2 h-[340px] sm:h-[440px]">
          {/* Main Primary Image */}
          <div className="md:col-span-2 h-full relative cursor-pointer group" onClick={() => setIsGalleryOpen(true)}>
            <img
              src={images[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"}
              alt="Main cover"
              className="w-full h-full object-cover group-hover:brightness-90 transition duration-200"
            />
          </div>

          {/* 2nd & 3rd Images */}
          <div className="hidden md:flex flex-col gap-2 h-full">
            <div className="h-1/2 relative cursor-pointer group" onClick={() => setIsGalleryOpen(true)}>
              <img
                src={images[1] || images[0]}
                alt="Interior 2"
                className="w-full h-full object-cover group-hover:brightness-90 transition duration-200"
              />
            </div>
            <div className="h-1/2 relative cursor-pointer group" onClick={() => setIsGalleryOpen(true)}>
              <img
                src={images[2] || images[0]}
                alt="Interior 3"
                className="w-full h-full object-cover group-hover:brightness-90 transition duration-200"
              />
            </div>
          </div>

          {/* 4th & 5th Images */}
          <div className="hidden md:flex flex-col gap-2 h-full relative">
            <div className="h-1/2 relative cursor-pointer group" onClick={() => setIsGalleryOpen(true)}>
              <img
                src={images[3] || images[0]}
                alt="Interior 4"
                className="w-full h-full object-cover group-hover:brightness-90 transition duration-200"
              />
            </div>
            <div className="h-1/2 relative cursor-pointer group" onClick={() => setIsGalleryOpen(true)}>
              <img
                src={images[4] || images[0]}
                alt="Interior 5"
                className="w-full h-full object-cover group-hover:brightness-90 transition duration-200"
              />
            </div>

            {/* "Show all photos" floating pill button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsGalleryOpen(true);
              }}
              className="absolute bottom-4 right-4 bg-white hover:bg-neutral-100 text-[#222222] font-semibold text-xs py-2 px-3.5 rounded-lg border border-black shadow-md flex items-center gap-2 cursor-pointer z-10"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Show all photos</span>
            </button>
          </div>
        </div>

        {/* Content Layout: 2 Columns (Details on Left, Sticky Booking Widget on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          
          {/* Left Column: Details & Amenities */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Host Banner */}
            <div className="flex items-center justify-between pb-6 border-b border-[#EBEBEB]">
              <div>
                <h3 className="text-xl font-bold text-[#222222]">
                  Entire {listing.property_type.toLowerCase()} hosted by {listing.host?.full_name}
                </h3>
                <p className="text-sm text-[#717171] mt-1">
                  {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.bathrooms} bathrooms
                </p>
              </div>
              <img
                src={listing.host?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={listing.host?.full_name}
                className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-xs"
              />
            </div>

            {/* Airbnb Highlights */}
            <div className="space-y-4 pb-6 border-b border-[#EBEBEB]">
              <div className="flex items-start gap-4">
                <Award className="w-6 h-6 text-[#222222] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#222222]">Superhost status</h4>
                  <p className="text-xs text-[#717171]">Superhosts are experienced, highly rated hosts committed to great stays.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-[#222222] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#222222]">AirCover protection</h4>
                  <p className="text-xs text-[#717171]">Every booking includes free protection from Host cancellations and listing inaccuracies.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-[#222222] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#222222]">Dedicated workspace</h4>
                  <p className="text-xs text-[#717171]">A room with high-speed wifi that’s well-suited for remote work.</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-[#EBEBEB]">
              <h4 className="text-lg font-bold text-[#222222] mb-3">About this space</h4>
              <p className="text-sm text-[#222222] leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="pb-6 border-b border-[#EBEBEB]">
              <h4 className="text-lg font-bold text-[#222222] mb-4">What this place offers</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listing.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-[#222222]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Already Booked Dates Notice (Calendar Availability Proof) */}
            {listing.booked_dates?.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Reserved Dates Blocked for this Property:</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {listing.booked_dates.map((range, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-white text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full font-medium"
                    >
                      🔒 {range.check_in} to {range.check_out} (Unavailable)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="pt-2 space-y-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-black text-black" />
                <h4 className="text-xl font-bold text-[#222222]">
                  {listing.average_rating ? listing.average_rating.toFixed(2) : "5.0"} · {listing.review_count} reviews
                </h4>
              </div>

              {/* Reviews List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {listing.reviews.map((rev) => (
                  <div key={rev.id} className="space-y-2 border border-gray-100 p-4 rounded-2xl bg-[#F7F7F7]/50">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.author?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                        alt={rev.author?.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold text-[#222222]">{rev.author?.full_name}</p>
                        <p className="text-xs text-[#717171]">★ {rev.rating_overall.toFixed(1)} rating</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#222222] leading-relaxed mt-2">{rev.comment}</p>
                  </div>
                ))}
              </div>

              {/* Leave a Review (Bonus Feature) */}
              <form onSubmit={handleAddReview} className="border border-[#DDDDDD] p-5 rounded-2xl bg-white space-y-3">
                <h5 className="font-bold text-sm text-[#222222]">Leave a Review for this stay</h5>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#717171]">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details of your experience at this property..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-black text-white text-xs font-semibold py-2 px-5 rounded-xl hover:bg-neutral-800 transition cursor-pointer disabled:opacity-50"
                >
                  {submittingReview ? "Posting..." : "Post Review"}
                </button>
              </form>

            </div>

          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white border border-[#DDDDDD] rounded-3xl p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)] space-y-4">
              
              {/* Header Price */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold text-[#222222]">
                    ₹{listing.price_per_night.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-[#717171] ml-1">night</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-black text-black" />
                  <span>{listing.average_rating ? listing.average_rating.toFixed(1) : "5.0"}</span>
                  <span className="text-[#717171]">({listing.review_count})</span>
                </div>
              </div>

              {/* Date & Guest Input Box */}
              <div className="border border-gray-400 rounded-2xl overflow-hidden divide-y divide-gray-400">
                <div className="grid grid-cols-2 divide-x divide-gray-400">
                  <div className="p-2.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#222222]">
                      Check-in
                    </label>
                    <input
                      type="date"
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full text-xs font-semibold mt-0.5 focus:outline-none bg-transparent cursor-pointer"
                    />
                  </div>
                  <div className="p-2.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#222222]">
                      Checkout
                    </label>
                    <input
                      type="date"
                      required
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full text-xs font-semibold mt-0.5 focus:outline-none bg-transparent cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-2.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#222222]">
                    Guests
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full text-xs font-semibold mt-0.5 focus:outline-none bg-transparent cursor-pointer"
                  >
                    {[...Array(listing.max_guests)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {bookingError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
                  {bookingError}
                </div>
              )}

              {/* Reserve Button */}
              <button
                onClick={handleReserve}
                disabled={bookingLoading || !totals}
                className="w-full airbnb-btn-gradient text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {bookingLoading ? "Reserving stay..." : "Reserve"}
              </button>

              <p className="text-center text-xs text-[#717171]">
                You won&apos;t be charged yet
              </p>

              {/* Price Breakdown */}
              {totals && (
                <div className="space-y-3 pt-3 border-t border-[#EBEBEB] text-sm text-[#222222]">
                  <div className="flex justify-between">
                    <span className="underline">
                      ₹{listing.price_per_night.toLocaleString("en-IN")} × {totals.nights} nights
                    </span>
                    <span>₹{totals.basePrice.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="underline">Cleaning fee</span>
                    <span>₹{totals.cleaningFee.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="underline">Airbnb service fee (12%)</span>
                    <span>₹{totals.serviceFee.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="h-[1px] bg-[#EBEBEB] my-2" />

                  <div className="flex justify-between text-base font-bold text-black">
                    <span>Total before taxes</span>
                    <span>₹{totals.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Full Photo Lightbox Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-6 sm:p-12 animate-in fade-in duration-200">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="sticky top-0 bg-white/90 backdrop-blur-xs py-4 flex items-center justify-between border-b border-gray-100 z-10">
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-[#222222] font-semibold flex items-center gap-1 text-sm"
              >
                <X className="w-5 h-5" />
                <span>Close gallery</span>
              </button>
              <span className="text-sm font-bold text-[#717171]">
                {images.length} photos · {listing.title}
              </span>
            </div>

            <div className="space-y-6">
              {images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="w-full rounded-2xl object-cover shadow-lg"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Confirmation Modal */}
      {isSuccessModalOpen && confirmedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-[#222222]">Stay Confirmed!</h3>
              <p className="text-xs text-[#717171] mt-1">
                Your reservation at <span className="font-semibold text-black">{listing.title}</span> has been booked and the calendar dates are locked.
              </p>
            </div>

            <div className="bg-[#F7F7F7] rounded-2xl p-4 space-y-2 text-xs text-[#222222]">
              <div className="flex justify-between">
                <span className="text-[#717171]">Reservation ID</span>
                <span className="font-mono font-semibold">{confirmedBooking.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#717171]">Dates</span>
                <span className="font-semibold">{confirmedBooking.check_in} → {confirmedBooking.check_out} ({confirmedBooking.total_nights} nights)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#717171]">Guests</span>
                <span className="font-semibold">{confirmedBooking.guest_count} guests</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200">
                <span>Total Paid (Mocked)</span>
                <span className="text-emerald-700">₹{confirmedBooking.total_price.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/trips")}
                className="flex-1 bg-black text-white py-3 rounded-xl text-xs font-bold hover:bg-neutral-800 transition cursor-pointer"
              >
                View My Trips
              </button>
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="px-5 py-3 border border-gray-300 rounded-xl text-xs font-semibold hover:border-black transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onUserLoggedIn={(u) => {
          setCurrentUser(u);
          loadData();
        }}
      />

      <Footer />
    </div>
  );
}
