"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { Booking, User } from "@/types";
import { fetchMyTrips, cancelBooking, fetchCurrentUser } from "@/lib/api";
import { Calendar, MapPin, Users, AlertCircle, ArrowLeft } from "lucide-react";

export default function TripsPage() {
  const [trips, setTrips] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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
    if (!confirm("Are you sure you want to cancel this reservation? The dates will be reopened for others.")) {
      return;
    }
    try {
      await cancelBooking(bookingId);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel reservation");
    }
  };

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
        <div className="flex items-center justify-between pb-6 border-b border-[#EBEBEB] mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#222222]">Trips</h1>
            <p className="text-sm text-[#717171] mt-1">
              Manage your upcoming reservations and past stays
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#222222] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore more homes</span>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 bg-neutral-100 rounded-2xl" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-3xl">
            <h3 className="text-lg font-bold text-[#222222]">No trips booked... yet!</h3>
            <p className="text-xs text-[#717171] mt-2 max-w-sm mx-auto">
              Time to dust off your bags and start planning your next great adventure.
            </p>
            <Link
              href="/"
              className="inline-block mt-5 px-6 py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition"
            >
              Start searching
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trips.map((trip) => {
              const isCancelled = trip.status === "cancelled";
              return (
                <div
                  key={trip.id}
                  className={`border rounded-3xl overflow-hidden flex flex-col sm:flex-row transition ${
                    isCancelled
                      ? "border-red-200 bg-red-50/30 opacity-70"
                      : "border-[#DDDDDD] bg-white hover:shadow-md"
                  }`}
                >
                  {/* Photo */}
                  <div className="sm:w-48 aspect-video sm:aspect-auto relative bg-neutral-100">
                    <img
                      src={trip.listing?.cover_image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"}
                      alt={trip.listing?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCancelled
                            ? "bg-red-600 text-white"
                            : "bg-emerald-600 text-white"
                        }`}
                      >
                        {isCancelled ? "Cancelled" : "Confirmed"}
                      </span>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-base text-[#222222] line-clamp-1">
                        {trip.listing?.title}
                      </h4>
                      <p className="text-xs text-[#717171] flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{trip.listing?.city}, {trip.listing?.country}</span>
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#222222]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#717171]" />
                        <span>
                          {trip.check_in} to {trip.check_out} ({trip.total_nights} nights)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-[#717171]" />
                        <span>{trip.guest_count} guests</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#EBEBEB] flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-[#717171] block">Total Paid</span>
                        <span className="text-sm font-bold text-black">
                          ₹{trip.total_price.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {!isCancelled && (
                        <button
                          onClick={() => handleCancelBooking(trip.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold underline cursor-pointer"
                        >
                          Cancel stay
                        </button>
                      )}
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
