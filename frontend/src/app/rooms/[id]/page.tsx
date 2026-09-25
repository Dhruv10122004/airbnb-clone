"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CurrencyModal from "@/components/CurrencyModal";
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
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  MessageCircle,
  Accessibility,
  UserCheck,
  Ban,
  Activity,
  Car,
} from "lucide-react";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected date slot from the sticky booking list
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

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
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
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

      // Pre-fill dates for next available slots
      const d1 = new Date();
      d1.setDate(d1.getDate() + 1);
      const d2 = new Date();
      d2.setDate(d2.getDate() + 3);

      setCheckIn(d1.toISOString().split("T")[0]);
      setCheckOut(d2.toISOString().split("T")[0]);
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

  // Generate 5 mock upcoming date slots matching frame_084s.jpg
  const dateSlots = [
    { label: "Tomorrow, 26 September", time: "2:30 – 4:30 am" },
    { label: "Sunday, 27 September", time: "2:30 – 4:30 am" },
    { label: "Monday, 28 September", time: "2:30 – 4:30 am" },
    { label: "Tuesday, 29 September", time: "2:30 – 4:30 am" },
    { label: "Wednesday, 30 September", time: "2:30 – 4:30 am" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenCurrencyModal={() => setIsCurrencyOpen(true)}
        currentUser={currentUser}
        onLogout={() => {
          localStorage.removeItem("airbnb_user_id");
          setCurrentUser(null);
          loadData();
        }}
      />

      <main className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16 py-8 w-full">
        {/* 
          Top Section: 
          Left: 2x2 Photo Grid matching frame_081s.jpg
          Right: Title Block, Rating, Host info, and Meta rows
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Photo Section: 2x2 Grid with Rounded Corners */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-2.5 rounded-2xl overflow-hidden relative cursor-pointer" onClick={() => setIsGalleryOpen(true)}>
            <div className="aspect-[4/3] overflow-hidden rounded-tl-2xl">
              <img
                src={images[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"}
                alt="Photo 1"
                className="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-tr-2xl">
              <img
                src={images[1] || images[0]}
                alt="Photo 2"
                className="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-bl-2xl">
              <img
                src={images[2] || images[0]}
                alt="Photo 3"
                className="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-br-2xl relative">
              <img
                src={images[3] || images[0]}
                alt="Photo 4"
                className="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGalleryOpen(true);
                }}
                className="absolute bottom-3 right-3 bg-white hover:bg-neutral-100 text-[#222222] font-semibold text-xs py-1.5 px-3 rounded-lg border border-black shadow-md flex items-center gap-1.5 z-10 cursor-pointer"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Show all</span>
              </button>
            </div>
          </div>

          {/* Right Column: Title Block & Host Info (frame_081s.jpg) */}
          <div className="lg:col-span-6 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight leading-tight">
              {listing.title}
            </h1>

            <p className="text-sm text-[#717171] leading-relaxed">
              {listing.description.split(".")[0]}.
            </p>

            {/* Rating & Location Line */}
            <div className="flex items-center gap-2 text-sm text-[#222222]">
              <span className="flex items-center gap-1 font-semibold">
                <Star className="w-4 h-4 fill-black text-black" />
                {listing.average_rating ? listing.average_rating.toFixed(2) : "4.91"}
              </span>
              <span>·</span>
              <span className="underline cursor-pointer">
                {listing.review_count} ratings
              </span>
            </div>

            <p className="text-xs text-[#717171]">
              {listing.city} · {listing.property_type}
            </p>

            {/* Action Row: Share and Save icons */}
            <div className="flex items-center gap-4 pt-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Listing link copied to clipboard!");
                }}
                aria-label="Share"
                className="p-2 rounded-full hover:bg-slate-100 text-[#222222] transition cursor-pointer"
              >
                <Share className="w-5 h-5" />
              </button>
              <button
                onClick={handleToggleWishlist}
                aria-label="Save"
                className="p-2 rounded-full hover:bg-slate-100 text-[#222222] transition cursor-pointer"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWishlisted ? "fill-[#FF385C] text-[#FF385C]" : "text-[#222222]"
                  }`}
                />
              </button>
            </div>

            <div className="h-[1px] bg-[#EBEBEB] my-3" />

            {/* Host Row from frame_081s.jpg */}
            <div className="flex items-center gap-3.5 py-1">
              <img
                src={listing.host?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
                alt={listing.host?.full_name}
                className="w-12 h-12 rounded-full object-cover border border-gray-200"
              />
              <div>
                <h4 className="text-sm font-bold text-[#222222]">
                  Hosted by {listing.host?.full_name}
                </h4>
                <p className="text-xs text-[#717171]">
                  {listing.host?.is_superhost ? "Superhost · Verified Guide" : "Local host & guide"}
                </p>
              </div>
            </div>

            {/* Meta Rows with Icons */}
            <div className="space-y-3 pt-2 text-xs text-[#222222]">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#717171] flex-shrink-0" />
                <span>{listing.address || `${listing.city}, ${listing.country}`}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#717171] flex-shrink-0" />
                <span>Around {listing.bedrooms * 2} hr experience · Hosted in English and Hindi</span>
              </div>
            </div>

            {/* Free Cancellation Card (frame_081s.jpg) */}
            <div className="p-3.5 bg-white border border-[#EBEBEB] rounded-2xl shadow-xs flex items-center justify-between text-xs mt-3">
              <div>
                <span className="font-bold text-[#E00B41]">Free cancellation</span>
                <span className="text-[#717171] ml-1">· Up to 1 day before start time</span>
              </div>
              <Calendar className="w-4 h-4 text-[#717171]" />
            </div>
          </div>
        </div>

        {/* 
          Main Content & Sticky Booking Card Grid 
          (frame_084s.jpg to frame_096s.jpg)
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative pt-6 border-t border-[#EBEBEB]">
          
          {/* Left Column: Itinerary, Map, Things to Know, Reviews */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* "What you'll do" Timeline from frame_084s.jpg */}
            <div>
              <h3 className="text-2xl font-bold text-[#222222] mb-6">What you&apos;ll do</h3>
              <div className="space-y-6 relative before:absolute before:left-7 before:top-4 before:bottom-4 before:w-[2px] before:bg-gray-200">
                <div className="flex items-start gap-5 relative">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-100 z-10 shadow-xs">
                    <img src={images[0]} alt="Step 1" className="w-full h-full object-cover" />
                  </div>
                  <div className="pt-1">
                    <h4 className="text-sm font-bold text-[#222222]">Arrival & Check-in</h4>
                    <p className="text-xs text-[#717171] mt-0.5 leading-relaxed">
                      Arrive at {listing.title} and settle into this beautiful space with refreshments.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5 relative">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-100 z-10 shadow-xs">
                    <img src={images[1] || images[0]} alt="Step 2" className="w-full h-full object-cover" />
                  </div>
                  <div className="pt-1">
                    <h4 className="text-sm font-bold text-[#222222]">Explore the Property & Views</h4>
                    <p className="text-xs text-[#717171] mt-0.5 leading-relaxed">
                      Enjoy the scenic balcony views, amenities, and personalized recommendations from {listing.host?.full_name}.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5 relative">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-100 z-10 shadow-xs">
                    <img src={images[2] || images[0]} alt="Step 3" className="w-full h-full object-cover" />
                  </div>
                  <div className="pt-1">
                    <h4 className="text-sm font-bold text-[#222222]">Relax & Unwind</h4>
                    <p className="text-xs text-[#717171] mt-0.5 leading-relaxed">
                      Take time for dinner, indoor amenities, or explore nearby cafes and attractions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* "Where we'll meet" Section from frame_090s.jpg */}
            <div className="pt-6 border-t border-[#EBEBEB]">
              <h3 className="text-2xl font-bold text-[#222222] mb-2">Where we&apos;ll meet</h3>
              <p className="text-xs text-[#717171] mb-4">
                {listing.address || `${listing.city}, ${listing.country}, 282001`}
              </p>

              {/* Embedded Map Canvas with Center Pin matching frame_090s.jpg */}
              <div className="aspect-[16/9] w-full bg-[#E5E3DF] rounded-3xl overflow-hidden relative border border-gray-200 shadow-xs flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:20px_20px]" />
                
                {/* Meeting Point Pin */}
                <div className="z-10 flex flex-col items-center animate-bounce">
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shadow-lg">
                    <MapPin className="w-5 h-5 fill-white" />
                  </div>
                  <span className="mt-1 bg-white text-black font-bold text-[11px] px-2 py-0.5 rounded-md shadow-md border border-gray-100">
                    Meeting point
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-bold text-gray-700">
                  Google Map Preview · {listing.city}
                </div>
              </div>
            </div>

            {/* "Things to know" from frame_096s.jpg */}
            <div className="pt-6 border-t border-[#EBEBEB]">
              <h3 className="text-2xl font-bold text-[#222222] mb-6">Things to know</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#222222]">
                <div className="space-y-1.5">
                  <UserCheck className="w-5 h-5 text-[#222222]" />
                  <h4 className="font-bold">Guest requirements</h4>
                  <p className="text-[#717171] leading-relaxed">
                    Guests aged 2 and up can attend. Accommodates up to {listing.max_guests} guests.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Activity className="w-5 h-5 text-[#222222]" />
                  <h4 className="font-bold">Activity level</h4>
                  <p className="text-[#717171] leading-relaxed">
                    The activity level for this stay is light and relaxed.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <CheckCircle2 className="w-5 h-5 text-[#222222]" />
                  <h4 className="font-bold">What&apos;s included</h4>
                  <p className="text-[#717171] leading-relaxed">
                    High speed wifi, private parking, and all listed amenities.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Ban className="w-5 h-5 text-[#222222]" />
                  <h4 className="font-bold">What&apos;s not included</h4>
                  <p className="text-[#717171] leading-relaxed">
                    Personal grocery shopping and extra transportation services.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Accessibility className="w-5 h-5 text-[#222222]" />
                  <h4 className="font-bold">Accessibility</h4>
                  <p className="text-[#717171] leading-relaxed">
                    Step-free path to entrance. Message your host for details.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Calendar className="w-5 h-5 text-[#222222]" />
                  <h4 className="font-bold">Cancellation policy</h4>
                  <p className="text-[#717171] leading-relaxed">
                    Cancel at least 1 day before check-in for a full refund.
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="pt-6 border-t border-[#EBEBEB]">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 fill-black text-black" />
                <h3 className="text-2xl font-bold text-[#222222]">
                  {listing.average_rating ? listing.average_rating.toFixed(2) : "4.91"} · {listing.review_count} ratings
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listing.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl border border-gray-100 bg-[#F7F7F7]/60 space-y-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.author?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                        alt={rev.author?.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#222222]">{rev.author?.full_name}</p>
                        <p className="text-[11px] text-[#717171]">★ {rev.rating_overall.toFixed(1)} rating · 1 day ago</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#222222] leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>

              {/* Leave a Review Form */}
              <form onSubmit={handleAddReview} className="mt-6 border border-[#DDDDDD] p-5 rounded-2xl bg-white space-y-3">
                <h4 className="font-bold text-sm text-[#222222]">Leave a Rating & Review</h4>
                <div className="flex items-center gap-2">
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
                  placeholder="Share details of your experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-black text-white text-xs font-semibold py-2 px-5 rounded-xl hover:bg-neutral-800 transition cursor-pointer"
                >
                  {submittingReview ? "Posting..." : "Post Review"}
                </button>
              </form>
            </div>

          </div>

          {/* 
            Right Column: Sticky Booking Card 
            (Exact Replica of frame_084s.jpg)
          */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-white border border-[#EBEBEB] rounded-3xl p-6 shadow-[0_6px_20px_rgba(0,0,0,0.12)] space-y-5">
              
              {/* Header: Price & "Show dates" Button from frame_084s.jpg */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-[#717171]">From</span>
                    <span className="text-xl font-bold text-[#222222]">
                      ₹{listing.price_per_night.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#717171]">/ guest</span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#E00B41] mt-0.5">
                    Free cancellation
                  </p>
                </div>

                <button
                  onClick={handleReserve}
                  disabled={bookingLoading}
                  className="bg-[#E00B41] hover:bg-[#D70466] text-white text-sm font-bold py-2.5 px-6 rounded-full shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {bookingLoading ? "Reserving..." : "Show dates"}
                </button>
              </div>

              {/* Date Slots List from frame_084s.jpg */}
              <div className="space-y-2.5">
                {dateSlots.map((slot, index) => {
                  const isSelected = selectedSlotIndex === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedSlotIndex(index)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? "border-black bg-slate-50 ring-1 ring-black"
                          : "border-[#DDDDDD] hover:border-black"
                      }`}
                    >
                      <h5 className="text-sm font-bold text-[#222222]">{slot.label}</h5>
                      <p className="text-xs text-[#717171] mt-0.5">{slot.time}</p>
                    </button>
                  );
                })}
              </div>

              {/* Error Message if any */}
              {bookingError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
                  {bookingError}
                </div>
              )}

              {/* Dynamic Financial Breakdown */}
              {totals && (
                <div className="space-y-2.5 pt-3 border-t border-[#EBEBEB] text-xs text-[#222222]">
                  <div className="flex justify-between">
                    <span className="underline">₹{listing.price_per_night.toLocaleString("en-IN")} × {totals.nights} nights</span>
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
                  <div className="flex justify-between text-sm font-bold text-black">
                    <span>Total</span>
                    <span>₹{totals.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}

              {/* Primary Reserve CTA */}
              <button
                onClick={handleReserve}
                disabled={bookingLoading}
                className="w-full airbnb-btn-gradient text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {bookingLoading ? "Reserving stay..." : "Confirm & Reserve"}
              </button>

            </div>
          </div>

        </div>
      </main>

      {/* Full Photo Lightbox Gallery */}
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
                Your reservation at <span className="font-semibold text-black">{listing.title}</span> has been confirmed.
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

      {/* Currency Modal */}
      <CurrencyModal
        isOpen={isCurrencyOpen}
        onClose={() => setIsCurrencyOpen(false)}
        selectedCurrency="INR"
        onSelectCurrency={() => {}}
      />

      <Footer />
    </div>
  );
}
