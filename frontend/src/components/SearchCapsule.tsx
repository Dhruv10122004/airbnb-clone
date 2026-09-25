"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

interface SearchCapsuleProps {
  onSearch: (params: {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }) => void;
}

const POPULAR_DESTINATIONS = [
  { city: "Noida", desc: "Popular homes & farm stays", icon: "🏙️" },
  { city: "Gurgaon", desc: "Modern villas & cyber city", icon: "🌆" },
  { city: "Goa", desc: "Beachfront villas & pools", icon: "🏖️" },
  { city: "Jaipur", desc: "Royal heritage havelis", icon: "🏰" },
  { city: "Manali", desc: "Pine cabins with snow views", icon: "🏔️" },
  { city: "Paris", desc: "Romantic artist lofts", icon: "🥐" },
];

const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];

export default function SearchCapsule({ onSearch }: SearchCapsuleProps) {
  const [activeField, setActiveField] = useState<"where" | "when" | "who" | null>(null);
  const [hoveredField, setHoveredField] = useState<"where" | "when" | "who" | null>(null);

  // Search parameters
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);

  // Dual calendar view state (start with current month)
  const [calendarBaseDate, setCalendarBaseDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const capsuleRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (capsuleRef.current && !capsuleRef.current.contains(event.target as Node)) {
        setActiveField(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveField(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const totalGuests = adults + children;

  // Handle Search Trigger
  const triggerSearch = () => {
    onSearch({
      destination: destination.trim() || undefined,
      checkIn: checkIn ? checkIn.toISOString().split("T")[0] : undefined,
      checkOut: checkOut ? checkOut.toISOString().split("T")[0] : undefined,
      guests: totalGuests > 1 ? totalGuests : undefined,
    });
    setActiveField(null);
  };

  // Calendar Helpers
  const nextMonthDate = new Date(calendarBaseDate.getFullYear(), calendarBaseDate.getMonth() + 1, 1);

  const prevMonths = () => {
    setCalendarBaseDate(new Date(calendarBaseDate.getFullYear(), calendarBaseDate.getMonth() - 1, 1));
  };

  const nextMonths = () => {
    setCalendarBaseDate(new Date(calendarBaseDate.getFullYear(), calendarBaseDate.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isBetweenDates = (date: Date, start: Date | null, end: Date | null) => {
    if (!start || !end) return false;
    const t = date.getTime();
    return t > start.getTime() && t < end.getTime();
  };

  const handleDateClick = (clickedDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (clickedDate < today) return; // disabled

    if (!checkIn || (checkIn && checkOut)) {
      // 1st click sets check-in, clears check-out
      setCheckIn(clickedDate);
      setCheckOut(null);
    } else if (checkIn && !checkOut) {
      if (clickedDate.getTime() > checkIn.getTime()) {
        // 2nd click sets checkout
        setCheckOut(clickedDate);
      } else {
        // Clicked before current check-in: restarts range
        setCheckIn(clickedDate);
        setCheckOut(null);
      }
    }
  };

  // Format date helper (e.g. "26 Sept 2026")
  const formatDateDisplay = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Helper to format "Who" value text in capsule
  const getWhoLabel = () => {
    if (totalGuests === 0 && pets === 0) return "Add guests";
    let text = `${totalGuests} guest${totalGuests === 1 ? "" : "s"}`;
    if (pets > 0) {
      text += `, ${pets} pet${pets === 1 ? "" : "s"}`;
    }
    return text;
  };

  // Helper to format "When" value text in capsule
  const getWhenLabel = () => {
    if (checkIn && checkOut) {
      return `${checkIn.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${checkOut.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
    }
    if (checkIn) {
      return `${checkIn.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – Add checkout`;
    }
    return "Add dates";
  };

  // Check divider visibility (hidden if either adjacent segment is hovered or active)
  const isDivider1Visible =
    activeField !== "where" &&
    activeField !== "when" &&
    hoveredField !== "where" &&
    hoveredField !== "when";

  const isDivider2Visible =
    activeField !== "when" &&
    activeField !== "who" &&
    hoveredField !== "when" &&
    hoveredField !== "who";

  return (
    <div ref={capsuleRef} className="w-full flex justify-center py-2 relative">
      {/* Collapsed/Active 3-Segment Capsule */}
      <div
        className={`flex items-center border rounded-full transition-all duration-200 max-w-2xl w-full relative ${
          activeField
            ? "bg-[#EBEBEB] border-transparent shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
            : "bg-white border-[#DDDDDD] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-md"
        }`}
      >
        {/* Segment 1: Where */}
        <div
          onClick={() => setActiveField(activeField === "where" ? null : "where")}
          onMouseEnter={() => setHoveredField("where")}
          onMouseLeave={() => setHoveredField(null)}
          className={`flex-1 py-2.5 px-6 rounded-full cursor-pointer transition-colors relative ${
            activeField === "where"
              ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
              : "hover:bg-[#EBEBEB]/80"
          }`}
        >
          <span className="block text-[12px] font-bold text-[#222222]">Where</span>
          <span
            className={`block text-[14px] truncate leading-tight ${
              destination ? "text-[#222222] font-medium" : "text-[#717171]"
            }`}
          >
            {destination || "Search destinations"}
          </span>
        </div>

        {/* Divider 1 */}
        <div
          className={`h-8 w-[1px] bg-[#EBEBEB] transition-opacity duration-150 ${
            isDivider1Visible ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Segment 2: When */}
        <div
          onClick={() => setActiveField(activeField === "when" ? null : "when")}
          onMouseEnter={() => setHoveredField("when")}
          onMouseLeave={() => setHoveredField(null)}
          className={`flex-1 py-2.5 px-6 rounded-full cursor-pointer transition-colors relative ${
            activeField === "when"
              ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
              : "hover:bg-[#EBEBEB]/80"
          }`}
        >
          <span className="block text-[12px] font-bold text-[#222222]">When</span>
          <span
            className={`block text-[14px] truncate leading-tight ${
              checkIn ? "text-[#222222] font-medium" : "text-[#717171]"
            }`}
          >
            {getWhenLabel()}
          </span>
        </div>

        {/* Divider 2 */}
        <div
          className={`h-8 w-[1px] bg-[#EBEBEB] transition-opacity duration-150 ${
            isDivider2Visible ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Segment 3: Who */}
        <div
          onClick={() => setActiveField(activeField === "who" ? null : "who")}
          onMouseEnter={() => setHoveredField("who")}
          onMouseLeave={() => setHoveredField(null)}
          className={`flex-1 py-2.5 pl-6 pr-2 rounded-full cursor-pointer transition-colors relative flex items-center justify-between ${
            activeField === "who"
              ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
              : "hover:bg-[#EBEBEB]/80"
          }`}
        >
          <div className="truncate pr-2">
            <span className="block text-[12px] font-bold text-[#222222]">Who</span>
            <span
              className={`block text-[14px] truncate leading-tight ${
                totalGuests > 1 || pets > 0 ? "text-[#222222] font-medium" : "text-[#717171]"
              }`}
            >
              {getWhoLabel()}
            </span>
          </div>

          {/* Search Button (40px Circle) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerSearch();
            }}
            aria-label="Search"
            className="w-10 h-10 rounded-full bg-[#E61E4D] hover:bg-[#D70466] flex items-center justify-center text-white flex-shrink-0 transition-transform active:scale-95 shadow-sm"
          >
            <Search className="w-4 h-4 stroke-[2.8]" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1b. "Where" Dropdown Panel (Left-aligned under Where segment)   */}
      {/* ------------------------------------------------------------- */}
      {activeField === "where" && (
        <div className="absolute top-full left-0 sm:left-4 mt-3 w-full sm:max-w-[500px] bg-white rounded-3xl shadow-2xl border border-[#EBEBEB] p-6 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center gap-2 pb-4 border-b border-[#EBEBEB]">
            <Search className="w-4 h-4 text-[#717171]" />
            <input
              type="text"
              autoFocus
              placeholder="Search destinations"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full text-sm font-semibold focus:outline-none bg-transparent placeholder-[#717171]"
            />
          </div>

          <div className="mt-4">
            <p className="text-[12px] font-bold text-[#717171] uppercase tracking-wider mb-2">
              Popular destinations
            </p>
            <div className="divide-y divide-[#EBEBEB]/50">
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest.city}
                  onClick={() => {
                    setDestination(dest.city);
                    setActiveField("when"); // Auto-advance to When as per spec
                  }}
                  className="w-full flex items-center gap-3.5 py-3 px-2 rounded-xl hover:bg-[#F7F7F7] transition text-left cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-white group-hover:shadow-xs transition">
                    {dest.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#222222]">{dest.city}</h4>
                    <p className="text-xs text-[#717171]">{dest.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1c. "When" Dropdown Panel (Dual Calendar - Homes variant)      */}
      {/* ------------------------------------------------------------- */}
      {activeField === "when" && (
        <div className="absolute top-full inset-x-0 mx-auto mt-3 w-full sm:max-w-[850px] bg-white rounded-3xl shadow-2xl border border-[#EBEBEB] p-6 sm:p-8 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* Top Toggle: Dates / Flexible */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1 bg-[#EBEBEB] rounded-full text-xs font-semibold">
              <button className="py-1.5 px-6 rounded-full bg-white text-black shadow-xs">
                Dates
              </button>
              <button className="py-1.5 px-6 rounded-full text-[#717171] hover:text-black">
                Flexible
              </button>
            </div>
          </div>

          {/* Dual Month Calendar Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            {/* Far Left Prev Month Chevron */}
            <button
              onClick={prevMonths}
              aria-label="Previous month"
              className="absolute -top-1 left-0 p-2 rounded-full hover:bg-slate-100 text-[#222222] transition z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Far Right Next Month Chevron */}
            <button
              onClick={nextMonths}
              aria-label="Next month"
              className="absolute -top-1 right-0 p-2 rounded-full hover:bg-slate-100 text-[#222222] transition z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Month 1 */}
            <MiniCalendar
              baseDate={calendarBaseDate}
              checkIn={checkIn}
              checkOut={checkOut}
              onDateClick={handleDateClick}
              isSameDay={isSameDay}
              isBetweenDates={isBetweenDates}
            />

            {/* Month 2 */}
            <MiniCalendar
              baseDate={nextMonthDate}
              checkIn={checkIn}
              checkOut={checkOut}
              onDateClick={handleDateClick}
              isSameDay={isSameDay}
              isBetweenDates={isBetweenDates}
            />
          </div>

          {/* Below Calendars: Check-in / Checkout Display Boxes */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#EBEBEB]">
            <div className="border border-gray-300 rounded-2xl p-3">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#717171]">
                Check-in
              </span>
              <span className="block text-sm font-semibold text-[#222222] mt-0.5">
                {formatDateDisplay(checkIn) || "Exact dates"}
              </span>
            </div>

            <div className="border border-gray-300 rounded-2xl p-3">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#717171]">
                Checkout
              </span>
              <span className="block text-sm font-semibold text-[#222222] mt-0.5">
                {formatDateDisplay(checkOut) || "Exact dates"}
              </span>
            </div>
          </div>

          {/* Footer: Clear Dates */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => {
                setCheckIn(null);
                setCheckOut(null);
              }}
              className="text-xs font-semibold text-[#222222] underline hover:text-black cursor-pointer"
            >
              Clear dates
            </button>

            {checkIn && checkOut && (
              <button
                onClick={() => setActiveField("who")}
                className="text-xs font-semibold text-[#FF385C] underline cursor-pointer"
              >
                Continue to guests →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1d. "Who" Dropdown Panel (Right-aligned under Who segment)    */}
      {/* ------------------------------------------------------------- */}
      {activeField === "who" && (
        <div className="absolute top-full right-0 sm:right-4 mt-3 w-full sm:max-w-[400px] bg-white rounded-3xl shadow-2xl border border-[#EBEBEB] p-6 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="divide-y divide-[#EBEBEB]">
            {/* Row 1: Adults */}
            <div className="py-4 first:pt-0 flex items-center justify-between">
              <div>
                <h4 className="text-[15px] font-bold text-[#222222]">Adults</h4>
                <p className="text-[13px] text-[#717171]">Ages 13 or above</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={adults <= 1}
                  onClick={() => setAdults(adults - 1)}
                  className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-sm font-bold text-[#717171] disabled:opacity-30 enabled:hover:border-black enabled:hover:text-black transition cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center text-sm font-semibold text-[#222222]">{adults}</span>
                <button
                  onClick={() => setAdults(adults + 1)}
                  className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-sm font-bold text-[#717171] hover:border-black hover:text-black transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Row 2: Children */}
            <div className="py-4 flex items-center justify-between">
              <div>
                <h4 className="text-[15px] font-bold text-[#222222]">Children</h4>
                <p className="text-[13px] text-[#717171]">Ages 2–12</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={children <= 0}
                  onClick={() => setChildren(children - 1)}
                  className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-sm font-bold text-[#717171] disabled:opacity-30 enabled:hover:border-black enabled:hover:text-black transition cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center text-sm font-semibold text-[#222222]">{children}</span>
                <button
                  onClick={() => setChildren(children + 1)}
                  className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-sm font-bold text-[#717171] hover:border-black hover:text-black transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Row 3: Infants */}
            <div className="py-4 flex items-center justify-between">
              <div>
                <h4 className="text-[15px] font-bold text-[#222222]">Infants</h4>
                <p className="text-[13px] text-[#717171]">Under 2</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={infants <= 0}
                  onClick={() => setInfants(infants - 1)}
                  className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-sm font-bold text-[#717171] disabled:opacity-30 enabled:hover:border-black enabled:hover:text-black transition cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center text-sm font-semibold text-[#222222]">{infants}</span>
                <button
                  onClick={() => setInfants(infants + 1)}
                  className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-sm font-bold text-[#717171] hover:border-black hover:text-black transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Row 4: Pets */}
            <div className="py-4 last:pb-0 flex items-center justify-between">
              <div>
                <h4 className="text-[15px] font-bold text-[#222222]">Pets</h4>
                <button className="text-[12px] text-[#717171] underline hover:text-black block text-left">
                  Bringing a service animal?
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={pets <= 0}
                  onClick={() => setPets(pets - 1)}
                  className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-sm font-bold text-[#717171] disabled:opacity-30 enabled:hover:border-black enabled:hover:text-black transition cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center text-sm font-semibold text-[#222222]">{pets}</span>
                <button
                  onClick={() => setPets(pets + 1)}
                  className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-sm font-bold text-[#717171] hover:border-black hover:text-black transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Reusable Mini Month Calendar for the Dual Calendar View
// ----------------------------------------------------------------------
interface MiniCalendarProps {
  baseDate: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  onDateClick: (d: Date) => void;
  isSameDay: (d1: Date | null, d2: Date | null) => boolean;
  isBetweenDates: (date: Date, start: Date | null, end: Date | null) => boolean;
}

function MiniCalendar({
  baseDate,
  checkIn,
  checkOut,
  onDateClick,
  isSameDay,
  isBetweenDates,
}: MiniCalendarProps) {
  const monthName = baseDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
  const leadingBlanks = Array.from({ length: firstDayIndex }, (_, i) => i);

  return (
    <div className="w-full select-none">
      {/* Month / Year Title */}
      <h4 className="text-center text-sm font-bold text-[#222222] mb-4">
        {monthName}
      </h4>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {DAYS_OF_WEEK.map((day, i) => (
          <span key={i} className="text-[12px] font-semibold text-[#717171]">
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {leadingBlanks.map((_, i) => (
          <div key={`blank-${i}`} className="h-10" />
        ))}

        {daysArray.map((date) => {
          const isPast = date < today;
          const isStart = isSameDay(date, checkIn);
          const isEnd = isSameDay(date, checkOut);
          const inRange = isBetweenDates(date, checkIn, checkOut);

          return (
            <div
              key={date.toISOString()}
              className={`h-10 relative flex items-center justify-center ${
                inRange ? "bg-[#F7F7F7]" : ""
              } ${isStart && checkOut ? "bg-gradient-to-r from-transparent to-[#F7F7F7]" : ""} ${
                isEnd && checkIn ? "bg-gradient-to-l from-transparent to-[#F7F7F7]" : ""
              }`}
            >
              <button
                disabled={isPast}
                onClick={() => onDateClick(date)}
                className={`w-9 h-9 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                  isStart || isEnd
                    ? "bg-black text-white"
                    : inRange
                    ? "text-black hover:bg-gray-200"
                    : isPast
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-[#222222] hover:bg-slate-100 cursor-pointer"
                }`}
              >
                {date.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
