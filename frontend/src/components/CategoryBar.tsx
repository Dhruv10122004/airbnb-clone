"use client";

import React, { useRef } from "react";
import {
  Globe,
  Sparkles,
  Tractor,
  Umbrella,
  Trees,
  Gem,
  Building2,
  Waves,
  MountainSnow,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  onOpenFilter: () => void;
  filterCount?: number;
}

const CATEGORIES = [
  { id: "all", label: "All", icon: Globe },
  { id: "popular", label: "Popular", icon: Sparkles },
  { id: "farms", label: "Farms", icon: Tractor },
  { id: "beachfront", label: "Beachfront", icon: Umbrella },
  { id: "cabins", label: "Cabins", icon: Trees },
  { id: "luxury", label: "Luxury", icon: Gem },
  { id: "iconic_cities", label: "Iconic cities", icon: Building2 },
  { id: "pools", label: "Amazing pools", icon: Waves },
  { id: "mountains", label: "Top of the world", icon: MountainSnow },
];

export default function CategoryBar({
  selectedCategory,
  onSelectCategory,
  onOpenFilter,
  filterCount = 0,
}: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -250 : 250;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="relative border-b border-[#EBEBEB] bg-white pt-4 pb-2 px-6 sm:px-10 lg:px-16 flex items-center gap-4">
      {/* Scroll Left Button */}
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="hidden md:flex p-1.5 rounded-full border border-gray-300 hover:border-black hover:shadow-md transition text-[#222222] bg-white z-10"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Categories Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-1"
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex flex-col items-center gap-2 pb-2 border-b-2 transition whitespace-nowrap cursor-pointer group ${
                isSelected
                  ? "border-black text-black opacity-100 font-semibold"
                  : "border-transparent text-[#717171] hover:text-black hover:border-gray-300 opacity-75 hover:opacity-100 font-medium"
              }`}
            >
              <Icon className={`w-6 h-6 transition group-hover:scale-105 ${isSelected ? "text-black" : "text-[#717171]"}`} />
              <span className="text-xs">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="hidden md:flex p-1.5 rounded-full border border-gray-300 hover:border-black hover:shadow-md transition text-[#222222] bg-white z-10"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Filter Button */}
      <button
        onClick={onOpenFilter}
        className="flex items-center gap-2.5 py-2.5 px-4 border border-[#DDDDDD] rounded-xl hover:border-black transition text-xs font-semibold text-[#222222] flex-shrink-0 cursor-pointer"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>Filters</span>
        {filterCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center">
            {filterCount}
          </span>
        )}
      </button>
    </div>
  );
}
