"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronLeft, ChevronRight, Navigation, Building2, Trees, Landmark, Palmtree } from "lucide-react";

interface SearchCapsuleProps {
  onSearch: (params: {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }) => void;
  activeNavTab?: "all" | "homes" | "experiences" | "services";
  selectedServiceCategory?: string | null;
  onSelectServiceCategory?: (cat: string | null) => void;
}

// Exact destination suggestions from frame_033s.jpg of rec1.mp4
const SUGGESTED_DESTINATIONS = [
  {
    city: "Nearby",
    desc: "Find what's around you",
    iconType: "nearby",
  },
  {
    city: "Noida, Uttar Pradesh",
    desc: "Near you",
    iconType: "noida",
  },
  {
    city: "Gurgaon District, Haryana",
    desc: "Near you",
    iconType: "gurgaon",
  },
  {
    city: "Dehradun, Uttarakhand",
    desc: "For nature lovers",
    iconType: "dehradun",
  },
  {
    city: "New Delhi, Delhi",
    desc: "For sights like India Gate",
    iconType: "delhi",
  },
  {
    city: "Greater Noida, Uttar Pradesh",
    desc: "Near you",
    iconType: "greater_noida",
  },
];

const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];

export default function SearchCapsule({
  onSearch,
  activeNavTab,
  selectedServiceCategory,
  onSelectServiceCategory,
}: SearchCapsuleProps) {
  const [activeField, setActiveField] = useState<"where" | "when" | "who" | null>(null);
  const [hoveredField, setHoveredField] = useState<"where" | "when" | "who" | null>(null);

  // Search parameters
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);

  // When tab mode: "dates" or "flexible"
  const [whenTab, setWhenTab] = useState<"dates" | "flexible">("dates");
  const [stayDuration, setStayDuration] = useState<"weekend" | "week" | "month">("weekend");
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [monthScrollIndex, setMonthScrollIndex] = useState(0);

  // 12 upcoming months dynamically computed from current date
  const upcomingMonths = React.useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      list.push({
        id: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        monthName: d.toLocaleString("en-US", { month: "long" }),
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
      });
    }
    return list;
  }, []);

  const handleToggleMonth = (monthId: string) => {
    setSelectedMonths((prev) =>
      prev.includes(monthId) ? prev.filter((m) => m !== monthId) : [...prev, monthId]
    );
  };

  // Calendar base date
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

  const triggerSearch = () => {
    let effectiveCheckIn = checkIn ? checkIn.toISOString().split("T")[0] : undefined;
    let effectiveCheckOut = checkOut ? checkOut.toISOString().split("T")[0] : undefined;

    if (whenTab === "flexible" && selectedMonths.length > 0) {
      const [yearStr, monthStr] = selectedMonths[0].split("-");
      const year = parseInt(yearStr);
      const month = parseInt(monthStr) - 1;

      if (stayDuration === "weekend") {
        const d = new Date(year, month, 1);
        while (d.getDay() !== 5) {
          d.setDate(d.getDate() + 1);
        }
        const endD = new Date(d);
        endD.setDate(d.getDate() + 2);
        effectiveCheckIn = d.toISOString().split("T")[0];
        effectiveCheckOut = endD.toISOString().split("T")[0];
      } else if (stayDuration === "week") {
        const d = new Date(year, month, 1);
        const endD = new Date(year, month, 8);
        effectiveCheckIn = d.toISOString().split("T")[0];
        effectiveCheckOut = endD.toISOString().split("T")[0];
      } else {
        const d = new Date(year, month, 1);
        const endD = new Date(year, month + 1, 0);
        effectiveCheckIn = d.toISOString().split("T")[0];
        effectiveCheckOut = endD.toISOString().split("T")[0];
      }
    }

    onSearch({
      destination: destination.trim() || undefined,
      checkIn: effectiveCheckIn,
      checkOut: effectiveCheckOut,
      guests: totalGuests > 0 ? totalGuests : undefined,
    });
    setActiveField(null);
  };

  // Calendar navigation
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
    if (clickedDate < today) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(clickedDate);
      setCheckOut(null);
    } else if (checkIn && !checkOut) {
      if (clickedDate.getTime() > checkIn.getTime()) {
        setCheckOut(clickedDate);
      } else {
        setCheckIn(clickedDate);
        setCheckOut(null);
      }
    }
  };

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getWhoLabel = () => {
    if (totalGuests === 0 && pets === 0) return "Add guests";
    let text = `${totalGuests} guest${totalGuests === 1 ? "" : "s"}`;
    if (pets > 0) {
      text += `, ${pets} pet${pets === 1 ? "" : "s"}`;
    }
    return text;
  };

  const getWhenLabel = () => {
    if (whenTab === "flexible") {
      if (selectedMonths.length === 0) {
        return "Anytime";
      }
      const durationText =
        stayDuration === "weekend" ? "A weekend" : stayDuration === "week" ? "A week" : "A month";

      const monthNames = selectedMonths.map((mId) => {
        const [yearStr, monthStr] = mId.split("-");
        const d = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
        return d.toLocaleString("en-US", { month: "short" });
      });

      if (monthNames.length === 1) {
        return `${durationText} in ${monthNames[0]}`;
      }
      return `${durationText} in ${monthNames.slice(0, 2).join(", ")}${monthNames.length > 2 ? "..." : ""}`;
    }

    if (checkIn && checkOut) {
      return `${checkIn.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${checkOut.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
    }
    if (checkIn) {
      return `${checkIn.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – Add dates`;
    }
    return "Add dates";
  };

  // Dividers visibility
  const isDivider1Visible =
    !activeField &&
    hoveredField !== "where" &&
    hoveredField !== "when";

  const isDivider2Visible =
    !activeField &&
    hoveredField !== "when" &&
    hoveredField !== "who";

  // Render authentic icon tiles from frame_033s.jpg
  const renderIconTile = (iconType: string) => {
    switch (iconType) {
      case "nearby":
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Navigation className="w-5 h-5 -rotate-45" />
          </div>
        );
      case "noida":
      case "greater_noida":
        return (
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        );
      case "gurgaon":
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Palmtree className="w-5 h-5" />
          </div>
        );
      case "dehradun":
        return (
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Trees className="w-5 h-5" />
          </div>
        );
      case "delhi":
        return (
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        );
    }
  };

  if (activeNavTab === "services") {
    return (
      <div className="w-full flex justify-center py-2 relative z-20">
        <div className="flex items-center rounded-full transition-all duration-200 bg-white border border-[#DDDDDD] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-md px-4 py-2 gap-3 cursor-pointer">
          <span className="text-xl select-none pl-1">🛎️</span>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-[#222222]">
              {selectedServiceCategory ? "Services in Gurugram" : "Anywhere"}
            </span>
            <div className="h-5 w-[1px] bg-[#EBEBEB]" />
            <span className="font-semibold text-[#222222]">Anytime</span>
            <div className="h-5 w-[1px] bg-[#EBEBEB]" />
            <span className={selectedServiceCategory ? "font-semibold text-[#222222]" : "text-[#717171]"}>
              {selectedServiceCategory
                ? selectedServiceCategory.charAt(0).toUpperCase() + selectedServiceCategory.slice(1)
                : "Add service"}
            </span>
          </div>
          <button
            onClick={() => onSearch({ destination: selectedServiceCategory || undefined })}
            aria-label="Search services"
            className="rounded-full bg-[#E00B41] hover:bg-[#D70466] w-9 h-9 flex items-center justify-center text-white ml-2 shadow-sm transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 
        Full-screen dim backdrop (frame_027s.jpg / authentic Airbnb UX):
        Clicking ANY blank space outside gracefully closes the search dropdown.
      */}
      {activeField && (
        <div
          className="fixed inset-0 bg-black/25 z-40 transition-opacity duration-200 cursor-pointer"
          onClick={() => setActiveField(null)}
          aria-hidden="true"
        />
      )}

      <div
        className={`w-full flex justify-center py-2 relative ${
          activeField ? "z-50" : "z-20"
        }`}
      >
        <div ref={capsuleRef} className="relative w-full max-w-2xl flex flex-col items-center">
          {/* 
            The Capsule:
            When activeField != null: container is bg-[#EBEBEB],
            and the active segment is pure white with rounded-full and shadow!
          */}
          <div
            className={`flex items-center rounded-full transition-all duration-200 w-full relative ${
              activeField
                ? "bg-[#EBEBEB] border border-transparent shadow-[0_6px_20px_rgba(0,0,0,0.1)] p-0"
                : "bg-white border border-[#DDDDDD] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-md"
            }`}
          >
        {/* Segment 1: Where */}
        <div
          onClick={() => setActiveField(activeField === "where" ? null : "where")}
          onMouseEnter={() => setHoveredField("where")}
          onMouseLeave={() => setHoveredField(null)}
          className={`flex-1 py-3 px-6 rounded-full cursor-pointer transition-all duration-200 relative ${
            activeField === "where"
              ? "bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
              : activeField
              ? "hover:bg-black/5"
              : "hover:bg-[#EBEBEB]/70"
          }`}
        >
          <span className="block text-[12px] font-bold text-[#222222]">Where</span>
          <span
            className={`block text-[14px] truncate leading-tight ${
              destination ? "text-[#222222] font-semibold" : "text-[#717171]"
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
          className={`flex-1 py-3 px-6 rounded-full cursor-pointer transition-all duration-200 relative ${
            activeField === "when"
              ? "bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
              : activeField
              ? "hover:bg-black/5"
              : "hover:bg-[#EBEBEB]/70"
          }`}
        >
          <span className="block text-[12px] font-bold text-[#222222]">When</span>
          <span
            className={`block text-[14px] truncate leading-tight ${
              checkIn ? "text-[#222222] font-semibold" : "text-[#717171]"
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
          className={`flex-1 py-3 pl-6 pr-2 rounded-full cursor-pointer transition-all duration-200 relative flex items-center justify-between ${
            activeField === "who"
              ? "bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
              : activeField
              ? "hover:bg-black/5"
              : "hover:bg-[#EBEBEB]/70"
          }`}
        >
          <div className="truncate pr-2">
            <span className="block text-[12px] font-bold text-[#222222]">Who</span>
            <span
              className={`block text-[14px] truncate leading-tight ${
                totalGuests > 0 || pets > 0 ? "text-[#222222] font-semibold" : "text-[#717171]"
              }`}
            >
              {getWhoLabel()}
            </span>
          </div>

          {/* 
            Search Button from frame_027s.jpg / frame_033s.jpg:
            When activeField != null, it expands to an oval pill with "Search" text!
          */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerSearch();
            }}
            aria-label="Search"
            className={`rounded-full bg-[#E00B41] hover:bg-[#D70466] flex items-center justify-center text-white flex-shrink-0 transition-all duration-200 shadow-sm cursor-pointer ${
              activeField
                ? "py-3 px-4 gap-2"
                : "w-10 h-10"
            }`}
          >
            <Search className="w-4 h-4 stroke-[3]" />
            {activeField && (
              <span className="text-sm font-bold tracking-tight">Search</span>
            )}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1b. "Where" Dropdown Panel (Exact Replica of frame_033s.jpg)   */}
      {/* ------------------------------------------------------------- */}
      {activeField === "where" && (
        <div className="absolute top-full left-0 sm:left-4 mt-3 w-full sm:max-w-[480px] bg-white rounded-[32px] shadow-[0_16px_36px_rgba(0,0,0,0.16)] border border-[#EBEBEB] p-6 z-50 animate-in fade-in zoom-in-95 duration-100">
          <p className="text-[12px] font-bold text-[#222222] mb-3">
            Suggested destinations
          </p>

          <div className="space-y-1">
            {SUGGESTED_DESTINATIONS.map((dest) => (
              <button
                key={dest.city}
                onClick={() => {
                  setDestination(dest.city);
                  setActiveField("when"); // auto advance to when as in spec
                }}
                className="w-full flex items-center gap-4 p-2.5 rounded-2xl hover:bg-[#F7F7F7] transition text-left cursor-pointer group"
              >
                {renderIconTile(dest.iconType)}
                <div>
                  <h4 className="text-[15px] font-semibold text-[#222222]">{dest.city}</h4>
                  <p className="text-[13px] text-[#717171]">{dest.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1c. "When" Dropdown Panel (Dual-Month Calendar / Flexible)   */}
      {/* ------------------------------------------------------------- */}
      {activeField === "when" && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[calc(100vw-32px)] sm:w-[850px] max-w-[850px] bg-white rounded-[32px] shadow-[0_16px_36px_rgba(0,0,0,0.16)] border border-[#EBEBEB] p-6 sm:p-8 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* Top Toggle: Dates / Flexible */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1 bg-[#EBEBEB] rounded-full text-xs font-semibold">
              <button
                type="button"
                onClick={() => setWhenTab("dates")}
                className={`py-2 px-6 rounded-full transition-all cursor-pointer ${
                  whenTab === "dates"
                    ? "bg-white text-black shadow-xs font-semibold"
                    : "text-[#717171] hover:text-black font-medium"
                }`}
              >
                Dates
              </button>
              <button
                type="button"
                onClick={() => setWhenTab("flexible")}
                className={`py-2 px-6 rounded-full transition-all cursor-pointer ${
                  whenTab === "flexible"
                    ? "bg-white text-black shadow-xs font-semibold"
                    : "text-[#717171] hover:text-black font-medium"
                }`}
              >
                Flexible
              </button>
            </div>
          </div>

          {whenTab === "flexible" ? (
            /* Flexible View: Exact Replica of Airbnb's Flexible Picker */
            <div className="space-y-8 py-2">
              {/* Question 1: How long would you like to stay? */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-[#222222] mb-4">
                  How long would you like to stay?
                </h3>
                <div className="inline-flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStayDuration("weekend")}
                    className={`py-2.5 px-6 rounded-full text-sm transition-all cursor-pointer ${
                      stayDuration === "weekend"
                        ? "border-2 border-black bg-[#F7F7F7] font-semibold text-black"
                        : "border border-gray-300 hover:border-black text-[#222222] font-medium"
                    }`}
                  >
                    Weekend
                  </button>
                  <button
                    type="button"
                    onClick={() => setStayDuration("week")}
                    className={`py-2.5 px-6 rounded-full text-sm transition-all cursor-pointer ${
                      stayDuration === "week"
                        ? "border-2 border-black bg-[#F7F7F7] font-semibold text-black"
                        : "border border-gray-300 hover:border-black text-[#222222] font-medium"
                    }`}
                  >
                    Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setStayDuration("month")}
                    className={`py-2.5 px-6 rounded-full text-sm transition-all cursor-pointer ${
                      stayDuration === "month"
                        ? "border-2 border-black bg-[#F7F7F7] font-semibold text-black"
                        : "border border-gray-300 hover:border-black text-[#222222] font-medium"
                    }`}
                  >
                    Month
                  </button>
                </div>
              </div>

              {/* Question 2: When do you want to go? */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-[#222222] mb-5">
                  When do you want to go?
                </h3>

                {/* Horizontal Month Carousel */}
                <div className="relative flex items-center justify-center">
                  {/* Left chevron if scrolled */}
                  {monthScrollIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => setMonthScrollIndex((prev) => Math.max(0, prev - 1))}
                      aria-label="Previous months"
                      className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-gray-300 bg-white hover:border-black shadow-sm flex items-center justify-center z-10 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 text-black" />
                    </button>
                  )}

                  {/* 6 Visible Month Cards */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 w-full max-w-[740px] transition-all">
                    {upcomingMonths.slice(monthScrollIndex, monthScrollIndex + 6).map((m) => {
                      const isSelected = selectedMonths.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleToggleMonth(m.id)}
                          className={`flex flex-col items-center justify-center h-32 rounded-2xl transition-all cursor-pointer ${
                            isSelected
                              ? "border-2 border-black bg-[#F7F7F7] shadow-xs"
                              : "border border-gray-200 hover:border-black bg-white"
                          }`}
                        >
                          <svg
                            className={`w-7 h-7 mb-2.5 transition-colors ${
                              isSelected ? "text-black" : "text-[#717171]"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="3" strokeWidth="1.5" />
                            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="1.5" />
                          </svg>
                          <span className="text-[14px] font-semibold text-[#222222]">
                            {m.monthName}
                          </span>
                          <span className="text-[12px] text-[#717171] mt-0.5">
                            {m.year}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right chevron if more months */}
                  {monthScrollIndex + 6 < upcomingMonths.length && (
                    <button
                      type="button"
                      onClick={() =>
                        setMonthScrollIndex((prev) =>
                          Math.min(upcomingMonths.length - 6, prev + 1)
                        )
                      }
                      aria-label="Next months"
                      className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-gray-300 bg-white hover:border-black shadow-sm flex items-center justify-center z-10 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 text-black" />
                    </button>
                  )}
                </div>
              </div>

              {/* Flexible Footer */}
              <div className="pt-4 flex items-center justify-between border-t border-[#EBEBEB]">
                <button
                  type="button"
                  onClick={() => setSelectedMonths([])}
                  className="text-xs font-semibold text-[#222222] underline hover:text-black cursor-pointer"
                >
                  Reset selection
                </button>
                <button
                  type="button"
                  onClick={() => setActiveField("who")}
                  className="text-xs font-semibold text-[#FF385C] underline cursor-pointer"
                >
                  Continue to guests →
                </button>
              </div>
            </div>
          ) : (
            /* Dates View: Dual Month Calendar */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                {/* Far Left Prev Month Chevron */}
                <button
                  onClick={prevMonths}
                  aria-label="Previous month"
                  className="absolute -top-1 left-0 p-2 rounded-full hover:bg-slate-100 text-[#222222] transition z-10 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Far Right Next Month Chevron */}
                <button
                  onClick={nextMonths}
                  aria-label="Next month"
                  className="absolute -top-1 right-0 p-2 rounded-full hover:bg-slate-100 text-[#222222] transition z-10 cursor-pointer"
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
            </>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1d. "Who" Dropdown Panel (Exact Replica of frame_027s.jpg)    */}
      {/* ------------------------------------------------------------- */}
      {activeField === "who" && (
        <div className="absolute top-full right-0 sm:right-4 mt-3 w-full sm:max-w-[420px] bg-white rounded-[32px] shadow-[0_16px_36px_rgba(0,0,0,0.16)] border border-[#EBEBEB] p-6 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="divide-y divide-[#EBEBEB]">
            {/* Row 1: Adults */}
            <div className="py-4 first:pt-0 flex items-center justify-between">
              <div>
                <h4 className="text-[16px] font-semibold text-[#222222]">Adults</h4>
                <p className="text-[14px] text-[#717171]">Ages 13 or above</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={adults <= 0}
                  onClick={() => setAdults(adults - 1)}
                  className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-base font-medium text-[#717171] disabled:opacity-30 enabled:hover:border-black enabled:hover:text-black transition cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center text-sm font-semibold text-[#222222]">{adults}</span>
                <button
                  onClick={() => setAdults(adults + 1)}
                  className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-base font-medium text-[#717171] hover:border-black hover:text-black transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Row 2: Children */}
            <div className="py-4 flex items-center justify-between">
              <div>
                <h4 className="text-[16px] font-semibold text-[#222222]">Children</h4>
                <p className="text-[14px] text-[#717171]">Ages 2–12</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={children <= 0}
                  onClick={() => setChildren(children - 1)}
                  className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-base font-medium text-[#717171] disabled:opacity-30 enabled:hover:border-black enabled:hover:text-black transition cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center text-sm font-semibold text-[#222222]">{children}</span>
                <button
                  onClick={() => setChildren(children + 1)}
                  className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-base font-medium text-[#717171] hover:border-black hover:text-black transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Row 3: Infants */}
            <div className="py-4 flex items-center justify-between">
              <div>
                <h4 className="text-[16px] font-semibold text-[#222222]">Infants</h4>
                <p className="text-[14px] text-[#717171]">Under 2</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={infants <= 0}
                  onClick={() => setInfants(infants - 1)}
                  className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-base font-medium text-[#717171] disabled:opacity-30 enabled:hover:border-black enabled:hover:text-black transition cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center text-sm font-semibold text-[#222222]">{infants}</span>
                <button
                  onClick={() => setInfants(infants + 1)}
                  className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-base font-medium text-[#717171] hover:border-black hover:text-black transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Row 4: Pets */}
            <div className="py-4 last:pb-0 flex items-center justify-between">
              <div>
                <h4 className="text-[16px] font-semibold text-[#222222]">Pets</h4>
                <button className="text-[13px] text-[#717171] underline hover:text-black block text-left cursor-pointer">
                  Bringing a service animal?
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={pets <= 0}
                  onClick={() => setPets(pets - 1)}
                  className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-base font-medium text-[#717171] disabled:opacity-30 enabled:hover:border-black enabled:hover:text-black transition cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center text-sm font-semibold text-[#222222]">{pets}</span>
                <button
                  onClick={() => setPets(pets + 1)}
                  className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-base font-medium text-[#717171] hover:border-black hover:text-black transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </>
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
