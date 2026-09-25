"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { ListingSummary } from "@/types";

interface ListingCardProps {
  listing: ListingSummary;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  nightsCount?: number;
}

export default function ListingCard({
  listing,
  isWishlisted,
  onToggleWishlist,
  nightsCount = 2,
}: ListingCardProps) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const images = listing.images?.length ? listing.images : [listing.cover_image];

  const handlePrevImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist(listing.id);
  };

  const totalCalculated = listing.price_per_night * nightsCount;
  const ratingFormatted = listing.average_rating ? listing.average_rating.toFixed(1) : "5.0";

  return (
    <div className="group flex flex-col relative cursor-pointer">
      {/* Image Carousel Container */}
      <div className="relative aspect-[20/19] w-full overflow-hidden rounded-2xl bg-neutral-100">
        <Link href={`/rooms/${listing.id}`} className="block w-full h-full">
          <img
            src={images[currentImgIndex]}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
          {/* Badge: Popular for services, Trending/Original for experiences, Guest favourite for homes */}
          {listing.property_type === "Service" ? (
            listing.is_guest_favourite ? (
              <div className="bg-white/95 backdrop-blur-xs text-[#222222] text-[12px] font-semibold px-2.5 py-1 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.18)] pointer-events-auto">
                Popular
              </div>
            ) : (
              <div />
            )
          ) : listing.property_type === "Experience" ? (
            <div className="bg-white/95 backdrop-blur-xs text-[#222222] text-[12px] font-semibold px-2.5 py-1 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.18)] pointer-events-auto">
              {listing.category === "originals" ? "✏️ Original" : "Trending"}
            </div>
          ) : listing.is_guest_favourite ? (
            <div className="bg-white/95 backdrop-blur-xs text-[#222222] text-[12px] font-semibold px-2.5 py-1 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.18)] pointer-events-auto">
              Guest favourite
            </div>
          ) : (
            <div />
          )}

          {/* Wishlist Heart Button */}
          <button
            onClick={handleHeartClick}
            aria-label="Add to wishlist"
            className="p-1.5 rounded-full pointer-events-auto transition hover:scale-115 active:scale-90"
          >
            <Heart
              className={`w-6 h-6 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] ${isWishlisted
                  ? "fill-[#FF385C] text-[#FF385C]"
                  : "fill-black/30 text-white stroke-[2]"
                }`}
            />
          </button>
        </div>

        {/* Left & Right Hover Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImg}
              aria-label="Previous image"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-black shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 z-10 hover:scale-105"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImg}
              aria-label="Next image"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-black shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 z-10 hover:scale-105"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Carousel Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            {images.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-200 ${idx === currentImgIndex
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/60"
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Target State: Exactly 2 lines under image */}
      <Link href={listing.property_type === "Service" ? `/services/${listing.id}` : `/rooms/${listing.id}`} className="mt-3 block">
        {/* Line 1: Title & Rating */}
        <div className="flex items-start justify-between gap-1">
          <h4 className="font-semibold text-[15px] text-[#222222] truncate leading-snug flex-1">
            {listing.title}
          </h4>
          <span className="font-medium text-[14px] text-[#222222] flex items-center gap-1 shrink-0 pt-0.5">
            <Star className="w-3.5 h-3.5 fill-black text-black inline" />
            {ratingFormatted}
          </span>
        </div>

        {/* Line 2: Location */}
        <p className="text-[13px] text-[#717171] truncate mt-0.5">
          {listing.city ? `${listing.city}${listing.state ? `, ${listing.state}` : listing.country ? `, ${listing.country}` : ""}` : (listing.property_type || "Stay")}
        </p>

        {/* Line 3: Pricing details */}
        {listing.property_type === "Service" ? (
          <div>
            {listing.description?.startsWith("In home") && (
              <p className="text-[13px] text-[#717171] truncate mt-0.5">
                {listing.description.split(".")[0]}
              </p>
            )}
            <p className="text-[14px] text-[#222222] mt-0.5">
              <span className="font-semibold text-[#222222]">
                ₹{listing.price_per_night.toLocaleString("en-IN")}
              </span>{" "}
              <span className="text-[#717171]">/ {listing.id === "srv_photo_4" ? "group" : "guest"}</span>
            </p>
          </div>
        ) : listing.property_type === "Experience" ? (
          <p className="text-[14px] text-[#222222] mt-0.5">
            <span className="font-semibold text-[#222222]">
              From ₹{listing.price_per_night.toLocaleString("en-IN")}
            </span>{" "}
            <span className="text-[#717171]">/ guest</span>
          </p>
        ) : (
          <p className="text-[14px] text-[#222222] mt-0.5 flex items-baseline gap-1">
            <span className="font-semibold text-[#222222]">
              ₹{listing.price_per_night.toLocaleString("en-IN")}
            </span>
            <span className="text-[#717171]">/ night</span>
            <span className="text-[#717171] text-[13px] ml-1">· ₹{totalCalculated.toLocaleString("en-IN")} for {nightsCount} nights</span>
          </p>
        )}
      </Link>
    </div>
  );
}
