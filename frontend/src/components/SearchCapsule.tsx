"use client";

import React, { useState } from "react";
import { Search, MapPin, Calendar, Users, X } from "lucide-react";

interface SearchCapsuleProps {
  onSearch: (params: {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }) => void;
}

export default function SearchCapsule({ onSearch }: SearchCapsuleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const totalGuests = adults + children;

  const popularDestinations = [
    { city: "Noida", desc: "Popular homes & farm stays", icon: "🏙️" },
    { city: "Gurgaon", desc: "Modern villas & cyber city", icon: "🌆" },
    { city: "Goa", desc: "Beachfront villas & pools", icon: "🏖️" },
    { city: "Jaipur", desc: "Royal heritage havelis", icon: "🏰" },
    { city: "Manali", desc: "Pine cabins with snow views", icon: "🏔️" },
    { city: "Paris", desc: "Romantic artist lofts", icon: "🥐" },
  ];

  const handleApplySearch = () => {
    onSearch({
      destination: destination.trim() || undefined,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests: totalGuests > 1 ? totalGuests : undefined,
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    setDestination("");
    setCheckIn("");
    setCheckOut("");
    setAdults(1);
    setChildren(0);
    onSearch({});
    setIsOpen(false);
  };

  return (
    <div className="w-full flex justify-center py-2 relative">
      {/* Compact Capsule (Default View as in Screenshot) */}
      {!isOpen ? (
        <div
          onClick={() => setIsOpen(true)}
          className="flex items-center divide-x divide-[#EBEBEB] border border-[#DDDDDD] rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-md transition-all cursor-pointer py-2 px-3 sm:px-6 bg-white max-w-2xl w-full"
        >
          {/* Where */}
          <div className="flex-1 px-3 text-left">
            <span className="block text-[11px] font-bold text-[#222222]">Where</span>
            <span className="block text-sm text-[#717171] truncate">
              {destination || "Search destinations"}
            </span>
          </div>

          {/* When */}
          <div className="flex-1 px-3 text-left">
            <span className="block text-[11px] font-bold text-[#222222]">When</span>
            <span className="block text-sm text-[#717171] truncate">
              {checkIn && checkOut ? `${checkIn} - ${checkOut}` : "Add dates"}
            </span>
          </div>

          {/* Who */}
          <div className="flex-1 px-3 text-left flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-bold text-[#222222]">Who</span>
              <span className="block text-sm text-[#717171] truncate">
                {totalGuests > 1 ? `${totalGuests} guests` : "Add guests"}
              </span>
            </div>
            <div className="ml-2 w-9 h-9 rounded-full bg-[#FF385C] flex items-center justify-center text-white flex-shrink-0">
              <Search className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>
      ) : (
        // Expanded Interactive Search Drawer
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex flex-col items-center pt-8 px-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#EBEBEB] max-w-3xl w-full p-6 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-[#717171]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#222222] mb-6">Find your next stay</h3>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-[#DDDDDD] rounded-2xl p-2 bg-[#F7F7F7]">
              {/* Destination Input */}
              <div className="p-3 bg-white rounded-xl shadow-xs">
                <label className="block text-xs font-bold text-[#222222]">Where</label>
                <input
                  type="text"
                  placeholder="Search destinations"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-sm font-medium mt-1 focus:outline-none bg-transparent placeholder-[#717171]"
                />
              </div>

              {/* Check-In / Check-Out */}
              <div className="p-3 bg-white rounded-xl shadow-xs">
                <label className="block text-xs font-bold text-[#222222]">Dates</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-1/2 text-xs font-medium focus:outline-none bg-transparent"
                  />
                  <span className="text-[#717171]">-</span>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-1/2 text-xs font-medium focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Guests Count */}
              <div className="p-3 bg-white rounded-xl shadow-xs flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-[#222222]">Guests</label>
                  <span className="text-sm font-medium text-[#222222] mt-1 block">
                    {totalGuests} {totalGuests === 1 ? "guest" : "guests"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={adults <= 1}
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm font-bold disabled:opacity-30 hover:border-black"
                  >
                    -
                  </button>
                  <span className="text-sm font-semibold">{adults}</span>
                  <button
                    onClick={() => setAdults(adults + 1)}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm font-bold hover:border-black"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Popular Picks */}
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#717171] mb-3">
                Suggested Destinations
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {popularDestinations.map((dest) => (
                  <button
                    key={dest.city}
                    onClick={() => setDestination(dest.city)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                      destination.toLowerCase() === dest.city.toLowerCase()
                        ? "border-black bg-slate-50"
                        : "border-[#EBEBEB] hover:border-black"
                    }`}
                  >
                    <span className="text-2xl">{dest.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#222222]">{dest.city}</p>
                      <p className="text-xs text-[#717171]">{dest.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-between border-t border-[#EBEBEB] pt-4">
              <button
                onClick={handleClear}
                className="text-sm font-semibold text-[#717171] underline hover:text-black cursor-pointer"
              >
                Clear all
              </button>
              <button
                onClick={handleApplySearch}
                className="airbnb-btn-gradient text-white font-semibold py-3 px-8 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
