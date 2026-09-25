"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { Booking, User } from "@/types";
import { fetchMyTrips, cancelBooking, fetchCurrentUser, addReview } from "@/lib/api";
import {
  Calendar,
  MapPin,
  Users,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Star,
  X,
} from "lucide-react";

export default function TripsPage() {
  const [trips, setTrips] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "upcoming" | "cancelled">("all");
  const [cancelToast, setCancelToast] = useState<string | null>(null);
  const [reviewModalTrip, setReviewModalTrip] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewedListingIds, setReviewedListingIds] = useState<Set<string>>(new Set());
  const [reviewToast, setReviewToast] = useState<string | null>(null);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalTrip) return;
    if (!reviewComment.trim()) {
      alert("Please write a short comment about your stay.");
      return;
    }
    setSubmittingReview(true);
    try {
      await addReview(reviewModalTrip.listing_id, {
        rating_overall: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewedListingIds((prev) => new Set(prev).add(reviewModalTrip.listing_id));
      setReviewToast("Review submitted successfully! Thank you for sharing your experience.");
      setTimeout(() => setReviewToast(null), 5000);
      setReviewModalTrip(null);
      setReviewComment("");
      setReviewRating(5);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookings, user] = await Promise.all([
        fetchMyTrips(),
        fetchCurrentUser().catch(() => null),
      ]);
      setTrips(bookings);
      setCurrentUser(user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this reservation? The dates will be unblocked and made available for others immediately.")) {
      return;
    }
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      setCancelToast("Reservation cancelled successfully. The booked dates have been released on the listing.");
      setTimeout(() => setCancelToast(null), 5000);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel reservation");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const filteredTrips = trips.filter((t) => {
    if (filterTab === "upcoming") return t.status === "confirmed";
    if (filterTab === "cancelled") return t.status === "cancelled";
    return true;
  });

  const confirmedCount = trips.filter((t) => t.status === "confirmed").length;
  const cancelledCount = trips.filter((t) => t.status === "cancelled").length;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar
        onOpenAuthModal={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        onLogout={() => {
          localStorage.removeItem("airbnb_user_id");
          setCurrentUser(null);
          loadData();
        }}
      />

      <main className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16 py-10 flex-1 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EBEBEB] mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#222222]">My Trips</h1>
            <p className="text-sm text-[#717171] mt-1">
              Manage your confirmed stays, dates, receipts, and past itineraries
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#222222] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore more homes</span>
          </Link>
        </div>

        {/* Cancellation Notification Toast */}
        {cancelToast && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{cancelToast}</span>
            </div>
            <button
              onClick={() => setCancelToast(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Review Notification Toast */}
        {reviewToast && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500 flex-shrink-0" />
              <span>{reviewToast}</span>
            </div>
            <button
              onClick={() => setReviewToast(null)}
              className="text-amber-800 hover:text-black font-bold ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
              filterTab === "all"
                ? "bg-black text-white"
                : "bg-neutral-100 text-[#717171] hover:text-black"
            }`}
          >
            All Trips ({trips.length})
          </button>
          <button
            onClick={() => setFilterTab("upcoming")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
              filterTab === "upcoming"
                ? "bg-black text-white"
                : "bg-neutral-100 text-[#717171] hover:text-black"
            }`}
          >
            Upcoming ({confirmedCount})
          </button>
          <button
            onClick={() => setFilterTab("cancelled")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
              filterTab === "cancelled"
                ? "bg-black text-white"
                : "bg-neutral-100 text-[#717171] hover:text-black"
            }`}
          >
            Cancelled ({cancelledCount})
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-neutral-100 rounded-3xl" />
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-3xl bg-neutral-50/50 space-y-3">
            <h3 className="text-xl font-bold text-[#222222]">
              {filterTab === "cancelled" ? "No cancelled trips" : "No trips booked... yet!"}
            </h3>
            <p className="text-xs text-[#717171] max-w-sm mx-auto">
              {filterTab === "cancelled"
                ? "You don't have any cancelled reservations."
                : "Time to dust off your bags and start planning your next great adventure."}
            </p>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition shadow-xs"
            >
              Start exploring homes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTrips.map((trip) => {
              const isCancelled = trip.status === "cancelled";
              return (
                <div
                  key={trip.id}
                  className={`border rounded-3xl overflow-hidden flex flex-col sm:flex-row transition ${
                    isCancelled
                      ? "border-red-200 bg-red-50/20 opacity-80"
                      : "border-[#DDDDDD] bg-white hover:shadow-md"
                  }`}
                >
                  {/* Photo Thumbnail */}
                  <Link
                    href={`/rooms/${trip.listing_id}`}
                    className="sm:w-52 aspect-video sm:aspect-auto relative bg-neutral-100 block group overflow-hidden flex-shrink-0"
                  >
                    <img
                      src={trip.listing?.cover_image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"}
                      alt={trip.listing?.title || "Listing thumbnail"}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 ${
                          isCancelled
                            ? "bg-red-600 text-white"
                            : "bg-emerald-600 text-white"
                        }`}
                      >
                        {isCancelled ? (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Cancelled</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Confirmed</span>
                          </>
                        )}
                      </span>
                    </div>
                  </Link>

                  {/* Trip Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/rooms/${trip.listing_id}`}
                          className="font-bold text-base text-[#222222] hover:underline line-clamp-1"
                        >
                          {trip.listing?.title}
                        </Link>
                        <span className="text-[10px] font-mono bg-neutral-100 text-[#717171] px-1.5 py-0.5 rounded flex-shrink-0">
                          HM-{trip.id.slice(0, 6).toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-[#717171] flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{trip.listing?.city}, {trip.listing?.country}</span>
                      </p>
                    </div>

                    <div className="space-y-2 text-xs text-[#222222] bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#717171]" />
                        <span className="font-semibold">
                          {formatDate(trip.check_in)} – {formatDate(trip.check_out)}
                        </span>
                        <span className="text-neutral-400">·</span>
                        <span className="text-[#717171]">{trip.total_nights} night{trip.total_nights > 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#717171]" />
                        <span>{trip.guest_count} guest{trip.guest_count > 1 ? "s" : ""}</span>
                      </div>
                    </div>

                    {/* Price Breakdown & Actions */}
                    <div className="pt-3 border-t border-[#EBEBEB] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#717171] block">
                          Total Amount
                        </span>
                        <span className="text-sm font-extrabold text-black">
                          ₹{trip.total_price.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                        <Link
                          href={`/rooms/${trip.listing_id}`}
                          className="text-xs font-semibold text-neutral-800 hover:text-black flex items-center gap-1 hover:underline"
                        >
                          <span>View stay</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        {!isCancelled && (
                          <>
                            <button
                              onClick={() => {
                                setReviewModalTrip(trip);
                                setReviewRating(5);
                                setReviewComment("");
                              }}
                              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-neutral-300 hover:border-black text-neutral-800 hover:text-black transition flex items-center gap-1.5 cursor-pointer bg-white"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  reviewedListingIds.has(trip.listing_id)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-neutral-500"
                                }`}
                              />
                              <span>
                                {reviewedListingIds.has(trip.listing_id) ? "Reviewed" : "Write a review"}
                              </span>
                            </button>

                            <button
                              onClick={() => handleCancelBooking(trip.id)}
                              disabled={cancellingId === trip.id}
                              className="text-xs text-red-600 hover:text-red-800 font-semibold underline cursor-pointer disabled:opacity-50"
                            >
                              {cancellingId === trip.id ? "Cancelling..." : "Cancel"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ──────────────────────────────────────────────────── */}
        {/* COMING SOON PLACEHOLDER SECTIONS */}
        {/* ──────────────────────────────────────────────────── */}
        <div className="mt-14 space-y-5">
          <h2 className="text-xl font-bold text-[#222222]">Coming Soon</h2>
          <p className="text-sm text-[#717171]">
            These features are planned and will be available in a future update.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* 🪪 Identity Verification */}
            <div className="border border-dashed border-[#DDDDDD] rounded-3xl p-6 bg-neutral-50/60 space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center text-xl">
                🪪
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#222222]">Identity Verification</h3>
                <p className="text-xs text-[#717171] mt-1 leading-relaxed">
                  Government ID upload, biometric liveness check, and host/guest trust score. Integration with Onfido / DigiLocker is planned.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-violet-700 bg-violet-100 px-2.5 py-1 rounded-full">
                <Clock className="w-3 h-3" /> Coming Soon
              </span>
            </div>

            {/* 🔐 Full OAuth & SMS Auth */}
            <div className="border border-dashed border-[#DDDDDD] rounded-3xl p-6 bg-neutral-50/60 space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center text-xl">
                🔐
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#222222]">Full Authentication</h3>
                <p className="text-xs text-[#717171] mt-1 leading-relaxed">
                  Real Google / Apple OAuth, SMS OTP login, and password-based accounts. Currently uses simplified demo profiles with guest vs host roles.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                <Clock className="w-3 h-3" /> Coming Soon
              </span>
            </div>

            {/* 💬 Guest ↔ Host Messaging */}
            <div className="border border-dashed border-[#DDDDDD] rounded-3xl p-6 bg-neutral-50/60 space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center text-xl">
                💬
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#222222]">Guest ↔ Host Messaging</h3>
                <p className="text-xs text-[#717171] mt-1 leading-relaxed">
                  Real-time in-app messaging between guests and hosts with read receipts, notifications, and booking-linked threads.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full">
                <Clock className="w-3 h-3" /> Coming Soon
              </span>
            </div>

            {/* 💳 Real Payment Processing */}
            <div className="border border-dashed border-[#DDDDDD] rounded-3xl p-6 bg-neutral-50/60 space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-xl">
                💳
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#222222]">Real Payment Processing</h3>
                <p className="text-xs text-[#717171] mt-1 leading-relaxed">
                  Stripe / Razorpay integration for live card, UPI, and net banking payments. Checkout is currently mocked — no real charge is made.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                <Clock className="w-3 h-3" /> Coming Soon
              </span>
            </div>

            {/* 🗺️ Live Pricing Pins on Map */}
            <div className="border border-dashed border-[#DDDDDD] rounded-3xl p-6 bg-neutral-50/60 space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center text-xl">
                🗺️
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#222222]">Live Pricing Pins on Map</h3>
                <p className="text-xs text-[#717171] mt-1 leading-relaxed">
                  Interactive map with real-time price bubbles per listing, clustering, and live availability filters. Currently shows a static OpenStreetMap.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                <Clock className="w-3 h-3" /> Coming Soon
              </span>
            </div>

          </div>
        </div>
      </main>

      {/* ──────────────────────────────────────────────────── */}
      {/* LEAVE A REVIEW MODAL */}
      {/* ──────────────────────────────────────────────────── */}
      {reviewModalTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-neutral-200 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-[#222222]">Write a Review</h3>
                <p className="text-xs text-[#717171] line-clamp-1 mt-0.5">
                  {reviewModalTrip.listing?.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalTrip(null)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-black cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-2 uppercase tracking-wide">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 rounded-lg hover:scale-110 transition cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 transition ${
                          star <= reviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-neutral-300 hover:text-neutral-400"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-bold text-[#222222]">
                    {reviewRating}.0 / 5.0
                  </span>
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-2 uppercase tracking-wide">
                  Your Feedback
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="What did you love about this stay? How was the host, location, and cleanliness?"
                  className="w-full text-sm p-3.5 rounded-2xl border border-neutral-300 focus:outline-hidden focus:border-black focus:ring-1 focus:ring-black placeholder:text-neutral-400 resize-none"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalTrip(null)}
                  className="px-4 py-2.5 rounded-full text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || !reviewComment.trim()}
                  className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#FF385C] hover:bg-[#E00B41] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
