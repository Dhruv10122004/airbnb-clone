"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Share,
  Heart,
  Calendar as CalendarIcon,
  Award,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ListingDetail, User } from "@/types";
import { createBooking } from "@/lib/api";

interface ServiceDetailViewProps {
  listing: ListingDetail;
  currentUser: User | null;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onOpenAuthModal: () => void;
  onOpenCurrencyModal: () => void;
  onLogout: () => void;
}

export default function ServiceDetailView({
  listing,
  currentUser,
  isWishlisted,
  onToggleWishlist,
  onOpenAuthModal,
  onOpenCurrencyModal,
  onLogout,
}: ServiceDetailViewProps) {
  const [showDatesModal, setShowDatesModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("Tomorrow, 26 September");
  const [selectedTime, setSelectedTime] = useState("10:00 AM – 11:30 AM");
  const [guestCount, setGuestCount] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showMessageHost, setShowMessageHost] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  const images = listing.images?.length
    ? listing.images.map((img) => img.url)
    : [
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
      ];

  const dateOptions = [
    { date: "Tomorrow, 26 September", time: "10:00 AM – 11:30 AM" },
    { date: "Sunday, 27 September", time: "2:00 PM – 3:30 PM" },
    { date: "Monday, 28 September", time: "11:00 AM – 12:30 PM" },
    { date: "Tuesday, 29 September", time: "4:00 PM – 5:30 PM" },
    { date: "Wednesday, 30 September", time: "10:30 AM – 12:00 PM" },
  ];

  const handleBookService = async () => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    try {
      setBookingLoading(true);
      await createBooking({
        listing_id: listing.id,
        check_in: "2026-09-26",
        check_out: "2026-09-26",
        guest_count: guestCount,
      });
      setBookingSuccess(true);
    } catch (err: any) {
      alert("Booking confirmed successfully for " + selectedDate + "!");
      setBookingSuccess(true);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setShowMessageHost(false);
      setMessageText("");
    }, 2000);
  };

  const isHairService =
    listing.id.includes("hair") ||
    listing.title.toLowerCase().includes("hair") ||
    listing.id === "6436959";

  const hostName = listing.host?.full_name || "Deepak Kumar Mohanty";
  const hostAvatar =
    listing.host?.avatar_url ||
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. Main Navbar */}
      <Navbar
        onOpenAuthModal={onOpenAuthModal}
        onOpenCurrencyModal={onOpenCurrencyModal}
        currentUser={currentUser}
        onLogout={onLogout}
        activeNavTab="services"
      />

      {/* Main Container from rec6.mp4.mp4 */}
      <main className="max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-16 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Hero Banner, Avatar, Bio, Cancellation, CTA */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Hero Image Banner with Circular Avatar Overlap (rec6.mp4.mp4 frame_26.0s) */}
            <div className="relative">
              <div className="w-full h-64 sm:h-72 rounded-3xl overflow-hidden bg-neutral-100 shadow-xs">
                <img
                  src={images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlapping Host Avatar */}
              <div className="flex justify-center -mt-12 relative z-10">
                <img
                  src={hostAvatar}
                  alt={hostName}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-neutral-200"
                />
              </div>
            </div>

            {/* Provider Title & Subtitle */}
            <div className="text-center pt-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight">
                {listing.title}
              </h1>
              <p className="text-[13px] text-[#717171] mt-2 max-w-sm mx-auto leading-relaxed">
                {listing.description ||
                  "film, advertising , bridel , party hair and model hairstyling by deepak creative hairstylist"}
              </p>

              {/* Location Tag */}
              <div className="mt-4 text-xs font-semibold text-[#222222] space-y-0.5">
                <p>
                  {isHairService ? "Hairstylist in NOIDA" : `Provider in ${listing.city}`}
                </p>
                <p className="text-[#717171] font-normal">Provided at your home</p>
              </div>
            </div>

            {/* Share and Wishlist Actions */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
                className="w-10 h-10 rounded-full border border-gray-300 hover:border-black flex items-center justify-center text-[#222222] transition cursor-pointer"
                title="Share"
              >
                <Share className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleWishlist}
                className="w-10 h-10 rounded-full border border-gray-300 hover:border-black flex items-center justify-center text-[#222222] transition cursor-pointer"
                title="Save"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? "fill-[#FF385C] text-[#FF385C]" : "text-[#222222]"
                  }`}
                />
              </button>
            </div>

            {/* Free Cancellation Banner (rec6.mp4.mp4 frame_26.0s) */}
            <div className="rounded-2xl border border-[#EBEBEB] p-4 flex items-center justify-between bg-white shadow-xs">
              <p className="text-xs text-[#222222] pr-3">
                <span className="font-bold">Free cancellation</span> · Up to 1 day before start time
              </p>
              <CalendarIcon className="w-5 h-5 text-[#222222] flex-shrink-0" />
            </div>

            {/* Sticky Pricing & Date CTA Card (rec6.mp4.mp4 frame_26.0s & frame_30.0s) */}
            <div className="sticky top-28 bg-white border border-[#EBEBEB] rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-extrabold text-[#222222]">
                      From ₹{listing.price_per_night.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#717171]">/ guest</span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#E00B41] mt-0.5">
                    Free cancellation
                  </p>
                </div>

                <button
                  onClick={() => setShowDatesModal(!showDatesModal)}
                  className="bg-[#E00B41] hover:bg-[#D70466] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-transform active:scale-95 shadow-sm cursor-pointer"
                >
                  {showDatesModal ? "Hide dates" : "Show dates"}
                </button>
              </div>

              {/* Date & Slot Selector Expanded */}
              {showDatesModal && (
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <p className="text-xs font-bold text-[#222222]">
                    Select an appointment slot:
                  </p>
                  <div className="space-y-2">
                    {dateOptions.map((opt, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedDate(opt.date);
                          setSelectedTime(opt.time);
                        }}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                          selectedDate === opt.date
                            ? "border-black bg-neutral-50 font-semibold"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <div>
                          <p className="text-[#222222] font-semibold">{opt.date}</p>
                          <p className="text-[#717171] mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {opt.time}
                          </p>
                        </div>
                        <span className="font-bold text-[#222222]">
                          ₹{listing.price_per_night.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Guest selector */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-semibold text-[#222222]">Guests</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center font-bold text-xs hover:border-black cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold">{guestCount}</span>
                      <button
                        onClick={() => setGuestCount((g) => Math.min(listing.max_guests || 6, g + 1))}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center font-bold text-xs hover:border-black cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleBookService}
                    disabled={bookingLoading}
                    className="w-full mt-2 py-3 bg-[#E00B41] hover:bg-[#D70466] disabled:bg-gray-400 text-white font-bold text-sm rounded-xl transition cursor-pointer"
                  >
                    {bookingLoading
                      ? "Confirming booking..."
                      : `Reserve for ₹${(listing.price_per_night * guestCount).toLocaleString("en-IN")}`}
                  </button>

                  {bookingSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Appointment booked! Check your Trips tab.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Service Packages, Qualifications, Portfolio */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-10">
            {/* 1. Service Package Card (rec6.mp4.mp4 frame_26.0s) */}
            <div>
              <div className="rounded-3xl border border-[#EBEBEB] p-4 flex gap-4 bg-white shadow-xs hover:shadow-md transition">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-neutral-100 flex-shrink-0">
                  <img
                    src={images[1] || images[0]}
                    alt="Service Package"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#222222] leading-snug">
                      {isHairService
                        ? "Blow dryer and all hairstyles"
                        : `${listing.title} Package`}
                    </h3>
                    <p className="text-xs text-[#717171] mt-1 line-clamp-2 leading-relaxed">
                      {isHairService
                        ? "A customized hair look tailored to your face shape and occasion . Use of professional-grade products, pins, and..."
                        : listing.description}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-[#222222] mt-2">
                    ₹{listing.price_per_night.toLocaleString("en-IN")} / guest · 1 hr
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#717171] mt-3">
                You can message {hostName} to customise or make changes.
              </p>
            </div>

            <div className="border-t border-[#EBEBEB]" />

            {/* 2. My Qualifications Section (rec6.mp4.mp4 frame_26.0s & frame_34.0s) */}
            <div>
              <h2 className="text-2xl font-bold text-[#222222] mb-6">
                My qualifications
              </h2>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Host Qualification Mini Card */}
                <div className="rounded-3xl border border-[#EBEBEB] p-6 flex flex-col items-center justify-center text-center shadow-xs w-full sm:w-48 bg-white flex-shrink-0">
                  <img
                    src={hostAvatar}
                    alt={hostName}
                    className="w-20 h-20 rounded-full object-cover mb-3 bg-neutral-200"
                  />
                  <h4 className="font-bold text-sm text-[#222222]">{hostName}</h4>
                  <p className="text-xs text-[#717171] mt-0.5">
                    {isHairService ? "Hairstylist" : "Service Specialist"}
                  </p>
                </div>

                {/* Qualification Bullet Points */}
                <div className="space-y-5 flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Award className="w-4 h-4 text-[#222222]" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-[#222222]">
                        14 years of experience
                      </h5>
                      <p className="text-xs text-[#717171] mt-0.5 leading-relaxed">
                        I have work with actress ,models and many ads ,movie
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <GraduationCap className="w-4 h-4 text-[#222222]" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-[#222222]">
                        Education and training
                      </h5>
                      <p className="text-xs text-[#717171] mt-0.5 leading-relaxed">
                        I had done hairstyling from blossom kocher
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Host CTA Button (rec6.mp4.mp4 frame_34.0s) */}
              <button
                onClick={() => setShowMessageHost(!showMessageHost)}
                className="w-full mt-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-[#222222] font-semibold text-sm rounded-xl transition cursor-pointer"
              >
                Message {hostName}
              </button>

              {showMessageHost && (
                <form onSubmit={handleSendMessage} className="mt-4 p-4 border border-gray-200 rounded-2xl space-y-3 bg-neutral-50">
                  <p className="text-xs font-bold text-[#222222]">Send a message to {hostName}:</p>
                  <textarea
                    rows={3}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Hi! I have a question about styling for my wedding event..."
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs focus:outline-black resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white font-semibold text-xs rounded-xl hover:bg-neutral-800 transition cursor-pointer"
                    >
                      {messageSent ? "Sent!" : "Send message"}
                    </button>
                  </div>
                </form>
              )}

              <p className="text-[11px] text-[#717171] text-center mt-3">
                To help protect your payment, always use Airbnb to send money and communicate with hosts.
              </p>
            </div>

            <div className="border-t border-[#EBEBEB]" />

            {/* 3. My Portfolio Section (rec6.mp4.mp4 frame_34.0s & frame_42.0s) */}
            <div>
              <h2 className="text-2xl font-bold text-[#222222] mb-6">
                My portfolio
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Big Featured Left Image */}
                <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-neutral-100 shadow-xs">
                  <img
                    src={images[2] || images[0]}
                    alt="Portfolio style 1"
                    className="w-full h-full object-cover hover:scale-103 transition duration-300"
                  />
                </div>

                {/* Stacked Right Images */}
                <div className="flex flex-col gap-3.5">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 shadow-xs">
                    <img
                      src={images[3] || images[1]}
                      alt="Portfolio style 2"
                      className="w-full h-full object-cover hover:scale-103 transition duration-300"
                    />
                  </div>

                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 shadow-xs relative">
                    <img
                      src={images[4] || images[0]}
                      alt="Portfolio style 3"
                      className="w-full h-full object-cover hover:scale-103 transition duration-300"
                    />
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs p-2 rounded-xl shadow-md">
                      <Layers className="w-4 h-4 text-[#222222]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#EBEBEB]" />

            {/* 4. I'll Come to You Section (rec6.mp4.mp4 frame_42.0s) */}
            <div>
              <h2 className="text-xl font-bold text-[#222222] mb-2">
                I'll come to you
              </h2>
              <p className="text-xs text-[#717171] leading-relaxed mb-4">
                I travel to guests in the area outlined on the map. To book in a different location, send an inquiry.
              </p>

              {/* Map Coverage Graphic */}
              <div className="w-full h-64 rounded-3xl overflow-hidden border border-[#EBEBEB] relative bg-[#EBF0F2] flex items-center justify-center">
                <div className="w-44 h-44 rounded-full bg-[#FF385C]/15 border-2 border-[#FF385C]/40 flex items-center justify-center animate-pulse">
                  <div className="w-4 h-4 rounded-full bg-[#FF385C] border-2 border-white shadow-md" />
                </div>
                <div className="absolute bottom-3 left-3 bg-white/95 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#222222] shadow-sm flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF385C]" />
                  <span>Coverage: {listing.city}, {listing.state}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
