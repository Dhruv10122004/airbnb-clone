"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { Booking, User } from "@/types";
import { fetchMyTrips, cancelBooking, fetchCurrentUser } from "@/lib/api";
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
} from "lucide-react";

export default function TripsPage() {
  const [trips, setTrips] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "upcoming" | "cancelled">("all");
  const [cancelToast, setCancelToast] = useState<string | null>(null);

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

                      <div className="flex items-center gap-3">
                        <Link
                          href={`/rooms/${trip.listing_id}`}
                          className="text-xs font-semibold text-neutral-800 hover:text-black flex items-center gap-1 hover:underline"
                        >
                          <span>View stay</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        {!isCancelled && (
                          <button
                            onClick={() => handleCancelBooking(trip.id)}
                            disabled={cancellingId === trip.id}
                            className="text-xs text-red-600 hover:text-red-800 font-semibold underline cursor-pointer disabled:opacity-50"
                          >
                            {cancellingId === trip.id ? "Cancelling..." : "Cancel"}
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

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
