"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchCapsule from "@/components/SearchCapsule";
import ListingCard from "@/components/ListingCard";
import AuthModal from "@/components/AuthModal";
import CurrencyModal from "@/components/CurrencyModal";
import PromoModal from "@/components/PromoModal";
import FilterModal from "@/components/FilterModal";
import Footer from "@/components/Footer";
import { ListingSummary, User } from "@/types";
import {
  fetchListings,
  fetchCurrentUser,
  fetchWishlistIds,
  toggleWishlist,
} from "@/lib/api";
import { Map, ArrowRight, ChevronLeft, ChevronRight, ChevronDown, SlidersHorizontal, Sparkles } from "lucide-react";

export default function HomePage() {
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // Navigation tab state (Homes / Experiences / Services / All)
  const [activeNavTab, setActiveNavTab] = useState<"all" | "homes" | "experiences" | "services">("homes");
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string | null>(null);

  // Search parameters
  const [searchParams, setSearchParams] = useState<{
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }>({});

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Category and advanced filters state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeFilters, setActiveFilters] = useState<{
    min_price?: number;
    max_price?: number;
    property_type?: string;
    amenities?: string;
  }>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  const filterCount =
    (activeFilters.min_price ? 1 : 0) +
    (activeFilters.max_price ? 1 : 0) +
    (activeFilters.property_type && activeFilters.property_type !== "All" ? 1 : 0) +
    (activeFilters.amenities ? activeFilters.amenities.split(",").filter(Boolean).length : 0);

  // Synchronize active tab with URL query parameter (?tab=...) and browser history
  useEffect(() => {
    const handleUrlTab = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as "all" | "homes" | "experiences" | "services" | null;
      if (tabParam && ["all", "homes", "experiences", "services"].includes(tabParam)) {
        setActiveNavTab(tabParam);
      }
    };
    handleUrlTab();
    window.addEventListener("popstate", handleUrlTab);
    return () => window.removeEventListener("popstate", handleUrlTab);
  }, []);

  // Trigger Promo Modal once for logged-out users after 2 seconds
  useEffect(() => {
    const promoDismissed = sessionStorage.getItem("airbnb_promo_dismissed");
    if (!promoDismissed) {
      const timer = setTimeout(() => {
        setIsPromoOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePromo = () => {
    sessionStorage.setItem("airbnb_promo_dismissed", "true");
    setIsPromoOpen(false);
  };

  // Load initial data
  const loadData = async (overrideUserId?: string | null) => {
    try {
      setLoading(true);

      // Only fetch user if there's an ID in localStorage (or we're explicitly passing one)
      const userId =
        overrideUserId !== undefined
          ? overrideUserId
          : typeof window !== "undefined"
            ? localStorage.getItem("airbnb_user_id")
            : null;

      const [allListings, wishIds] = await Promise.allSettled([
        fetchListings({
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          destination: searchParams.destination,
          check_in: searchParams.checkIn,
          check_out: searchParams.checkOut,
          guests: searchParams.guests,
          min_price: activeFilters.min_price,
          max_price: activeFilters.max_price,
          property_type:
            activeFilters.property_type && activeFilters.property_type !== "All"
              ? activeFilters.property_type
              : undefined,
          amenities: activeFilters.amenities,
        }),
        fetchWishlistIds(),
      ]);

      if (allListings.status === "fulfilled") setListings(allListings.value);
      if (wishIds.status === "fulfilled") setWishlistIds(wishIds.value);

      if (userId) {
        const userResult = await fetchCurrentUser().catch(() => null);
        setCurrentUser(userResult);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadData();
  }, [searchParams, selectedCategory, activeFilters]);

  const handleToggleWishlist = async (listingId: string) => {
    try {
      const res = await toggleWishlist(listingId);
      if (res.is_saved) {
        setWishlistIds((prev) => [...prev, listingId]);
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== listingId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("airbnb_user_id");
    setCurrentUser(null);
    setWishlistIds([]);
    // Do NOT call loadData here — that would re-fetch and potentially restore the user
  };

  // Helper to ensure home sections ONLY include genuine home stays (not Services or Experiences)
  const isHomeListing = (l: ListingSummary) =>
    l.property_type !== "Service" &&
    l.property_type !== "Experience" &&
    l.category !== "services" &&
    l.category !== "experiences" &&
    l.category !== "originals" &&
    !l.id.startsWith("srv_") &&
    !l.id.startsWith("exp_") &&
    l.id !== "6436959";

  // Filter listings by city to match exact sections from recording (frame_027s.jpg)
  const noidaHomes = listings.filter(
    (l) => l.city.toLowerCase() === "noida" && isHomeListing(l)
  );
  const gurgaonHomes = listings.filter(
    (l) => l.city.toLowerCase() === "gurgaon" && isHomeListing(l)
  );
  const otherHomes = listings.filter(
    (l) =>
      l.city.toLowerCase() !== "noida" &&
      l.city.toLowerCase() !== "gurgaon" &&
      isHomeListing(l)
  );
  // Service listings from backend & exact fallbacks from rec6.mp4.mp4
  const serviceListings = listings.filter(
    (l) => l.property_type === "Service" || l.category === "services"
  );

  const fallbackPhotoServices: ListingSummary[] = [
    {
      id: "srv_photo_1",
      title: "New Delhi photo session by a Female Photographer",
      city: "New Delhi",
      price_per_night: 8500,
      cover_image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200",
      images: [
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200",
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800",
      ],
      is_guest_favourite: true,
      property_type: "Service",
      average_rating: 5.0,
      reviews_count: 38,
    },
    {
      id: "srv_photo_2",
      title: "Candid travel portraits by Anurag",
      city: "New Delhi",
      price_per_night: 8000,
      cover_image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"],
      is_guest_favourite: true,
      property_type: "Service",
      average_rating: 5.0,
      reviews_count: 24,
    },
    {
      id: "srv_photo_3",
      title: "Story filled portraits by Rohit",
      city: "New Delhi",
      price_per_night: 7000,
      cover_image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800",
      images: ["https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800"],
      is_guest_favourite: true,
      property_type: "Service",
      average_rating: 5.0,
      reviews_count: 19,
    },
    {
      id: "srv_photo_4",
      title: "Artful city portraits by Ashish",
      city: "New Delhi",
      price_per_night: 9500,
      cover_image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800",
      images: ["https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800"],
      is_guest_favourite: false,
      property_type: "Service",
      average_rating: 4.95,
      reviews_count: 15,
    },
    {
      id: "srv_photo_5",
      title: "Fine visual art by Moneesha",
      city: "Gurugram",
      price_per_night: 4800,
      cover_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"],
      is_guest_favourite: false,
      property_type: "Service",
      average_rating: 4.9,
      reviews_count: 12,
    },
    {
      id: "srv_photo_6",
      title: "Stunning Corporate Portraits by Vishal Diwan",
      city: "Gurugram",
      price_per_night: 4000,
      cover_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
      images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"],
      is_guest_favourite: false,
      property_type: "Service",
      average_rating: 4.88,
      reviews_count: 9,
    },
  ];

  const fallbackHairServices: ListingSummary[] = [
    {
      id: "srv_hair_govind",
      title: "Runway ready hair looks by Govind",
      description: "In home · Blow-drys, dry styling and more",
      city: "Gurugram",
      price_per_night: 1299,
      cover_image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
      images: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
      ],
      is_guest_favourite: false,
      property_type: "Service",
      average_rating: 5.0,
      reviews_count: 22,
    },
    {
      id: "srv_hair_nidhi",
      title: "Elegant event hairstyles by Nidhi",
      description: "In home · Dry styling",
      city: "Gurugram",
      price_per_night: 1700,
      cover_image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800",
      images: [
        "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800",
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      ],
      is_guest_favourite: false,
      property_type: "Service",
      average_rating: 4.95,
      reviews_count: 14,
    },
    {
      id: "srv_hair_salon",
      title: "Elegant event hairstyles by Salon At Door",
      description: "In home · Up-dos",
      city: "NOIDA",
      price_per_night: 1302,
      cover_image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800",
      images: ["https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800"],
      is_guest_favourite: false,
      property_type: "Service",
      average_rating: 4.9,
      reviews_count: 18,
    },
    {
      id: "srv_hair_deepak",
      title: "Deepak mohanty hairstylist",
      description: "In home · Up-dos",
      city: "NOIDA",
      price_per_night: 2000,
      cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
      images: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
      ],
      is_guest_favourite: true,
      property_type: "Service",
      average_rating: 5.0,
      reviews_count: 31,
    },
  ];

  const fallbackTrainServices: ListingSummary[] = [
    {
      id: "srv_train_1",
      title: "Strength and mobility sessions by Mayank",
      city: "Gurugram",
      price_per_night: 1800,
      cover_image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800",
      images: ["https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800"],
      is_guest_favourite: true,
      property_type: "Service",
      average_rating: 5.0,
      reviews_count: 28,
    },
    {
      id: "srv_train_2",
      title: "Yoga Flow & Alignment by Priya",
      city: "Gurugram",
      price_per_night: 1500,
      cover_image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800",
      images: ["https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800"],
      is_guest_favourite: false,
      property_type: "Service",
      average_rating: 4.95,
      reviews_count: 17,
    },
    {
      id: "srv_train_3",
      title: "Breathwork and sound healing session",
      city: "New Delhi",
      price_per_night: 2200,
      cover_image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
      images: ["https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"],
      is_guest_favourite: false,
      property_type: "Service",
      average_rating: 5.0,
      reviews_count: 12,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. Top Navbar with exact 3D Tabs matching frame_000s.jpg */}
      <Navbar
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenCurrencyModal={() => setIsCurrencyOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        activeNavTab={activeNavTab}
        onSelectNavTab={setActiveNavTab}
      />

      {/* 2. Search Capsule */}
      <div className="bg-white py-4 px-4 flex justify-center">
        <SearchCapsule
          onSearch={setSearchParams}
          activeNavTab={activeNavTab}
          selectedServiceCategory={selectedServiceCategory}
          onSelectServiceCategory={setSelectedServiceCategory}
        />
      </div>

      {/* 3. Main Content */}
      <main className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-16 pt-6 pb-16 flex-1 w-full">

        {/* ======================================================== */}
        {/* VIEW 1: HOMES or ALL (Default or Filtered)               */}
        {/* ======================================================== */}
        {(activeNavTab === "homes" || activeNavTab === "all") && (
          <div className="space-y-12">
            {Boolean(
              searchParams.destination ||
              searchParams.checkIn ||
              searchParams.checkOut ||
              searchParams.guests ||
              selectedCategory !== "all" ||
              activeFilters.min_price ||
              activeFilters.max_price ||
              (activeFilters.property_type && activeFilters.property_type !== "All") ||
              activeFilters.amenities
            ) ? (
              /* DYNAMIC SEARCH & FILTER RESULTS VIEW */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                      {searchParams.destination
                        ? `Stays in ${searchParams.destination}`
                        : selectedCategory !== "all"
                        ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace("_", " ")} stays`
                        : "Filtered Stays"}
                    </h2>
                    <p className="text-sm text-[#717171] mt-1">
                      {listings.filter(isHomeListing).length}{" "}
                      {listings.filter(isHomeListing).length === 1 ? "stay" : "stays"} found
                      {searchParams.guests ? ` · ${searchParams.guests} guests` : ""}
                      {searchParams.checkIn && searchParams.checkOut
                        ? ` · ${searchParams.checkIn} to ${searchParams.checkOut}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsFilterOpen(true)}
                      className="flex items-center gap-1.5 py-1.5 px-3 border border-gray-300 rounded-full hover:border-black transition text-xs font-semibold text-[#222222] cursor-pointer bg-white"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Filters</span>
                      {filterCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center">
                          {filterCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSearchParams({});
                        setSelectedCategory("all");
                        setActiveFilters({});
                      }}
                      className="text-xs font-semibold underline text-[#222222] hover:text-[#717171] cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>

                {listings.filter(isHomeListing).length === 0 ? (
                  <div className="py-16 text-center flex flex-col items-center justify-center space-y-3 bg-neutral-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-lg font-semibold text-[#222222]">No stays found</p>
                    <p className="text-sm text-[#717171] max-w-md">
                      Try adjusting or clearing your filters, price range, or destination to see available stays.
                    </p>
                    <button
                      onClick={() => {
                        setSearchParams({});
                        setSelectedCategory("all");
                        setActiveFilters({});
                      }}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                      {listings
                        .filter(isHomeListing)
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map((listing) => (
                          <ListingCard
                            key={listing.id}
                            listing={listing}
                            isWishlisted={wishlistIds.includes(listing.id)}
                            onToggleWishlist={handleToggleWishlist}
                          />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {Math.ceil(listings.filter(isHomeListing).length / pageSize) > 1 && (
                      <div className="flex flex-col items-center justify-center pt-8 pb-4 gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            disabled={currentPage === 1}
                            onClick={() => {
                              setCurrentPage((p) => Math.max(1, p - 1));
                              window.scrollTo({ top: 300, behavior: "smooth" });
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-full text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:border-black transition"
                          >
                            Previous
                          </button>
                          {Array.from({
                            length: Math.ceil(listings.filter(isHomeListing).length / pageSize),
                          }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setCurrentPage(i + 1);
                                window.scrollTo({ top: 300, behavior: "smooth" });
                              }}
                              className={`w-8 h-8 rounded-full text-xs font-semibold transition ${
                                currentPage === i + 1
                                  ? "bg-black text-white"
                                  : "hover:bg-gray-100 text-[#222222]"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button
                            disabled={
                              currentPage === Math.ceil(listings.filter(isHomeListing).length / pageSize)
                            }
                            onClick={() => {
                              setCurrentPage((p) =>
                                Math.min(
                                  Math.ceil(listings.filter(isHomeListing).length / pageSize),
                                  p + 1
                                )
                              );
                              window.scrollTo({ top: 300, behavior: "smooth" });
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-full text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:border-black transition"
                          >
                            Next
                          </button>
                        </div>
                        <p className="text-xs text-[#717171]">
                          Showing {(currentPage - 1) * pageSize + 1} –{" "}
                          {Math.min(currentPage * pageSize, listings.filter(isHomeListing).length)} of{" "}
                          {listings.filter(isHomeListing).length} stays
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              /* DEFAULT CURATED SECTIONS VIEW */
              <>
                {/* Section 1: Popular homes in Noida */}
                {noidaHomes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2 group cursor-pointer">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                          Popular homes in Noida
                        </h2>
                        <ArrowRight className="w-5 h-5 text-[#222222] transition-transform group-hover:translate-x-1" />
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => setIsFilterOpen(true)}
                          className="flex items-center gap-1.5 py-1.5 px-3 border border-gray-300 rounded-full hover:border-black transition text-xs font-semibold text-[#222222] cursor-pointer bg-white"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Filters</span>
                          {filterCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center">
                              {filterCount}
                            </span>
                          )}
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-gray-400 hover:text-black transition cursor-pointer">
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-black transition cursor-pointer">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                      {noidaHomes.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          isWishlisted={wishlistIds.includes(listing.id)}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 2: Available in Gurgaon District this weekend */}
                {gurgaonHomes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2 group cursor-pointer">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                          Available in Gurgaon District this weekend
                        </h2>
                        <ArrowRight className="w-5 h-5 text-[#222222] transition-transform group-hover:translate-x-1" />
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-gray-400 hover:text-black transition cursor-pointer">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-black transition cursor-pointer">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                      {gurgaonHomes.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          isWishlisted={wishlistIds.includes(listing.id)}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 3: Iconic Stays & Escapes */}
                {otherHomes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2 group cursor-pointer">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                          Iconic Stays & Vacation Escapes
                        </h2>
                        <ArrowRight className="w-5 h-5 text-[#222222] transition-transform group-hover:translate-x-1" />
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-gray-400 hover:text-black transition cursor-pointer">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-black transition cursor-pointer">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                      {otherHomes.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          isWishlisted={wishlistIds.includes(listing.id)}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Stays Paginated Grid */}
                {listings.filter(isHomeListing).length > 0 && (
                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                          All Stays & Vacation Rentals
                        </h2>
                        <p className="text-xs text-[#717171] mt-0.5">Explore our full verified catalog</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                      {listings
                        .filter(isHomeListing)
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map((listing) => (
                          <ListingCard
                            key={`all_${listing.id}`}
                            listing={listing}
                            isWishlisted={wishlistIds.includes(listing.id)}
                            onToggleWishlist={handleToggleWishlist}
                          />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {Math.ceil(listings.filter(isHomeListing).length / pageSize) > 1 && (
                      <div className="flex flex-col items-center justify-center pt-8 pb-4 gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="px-4 py-2 border border-gray-300 rounded-full text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:border-black transition"
                          >
                            Previous
                          </button>
                          {Array.from({
                            length: Math.ceil(listings.filter(isHomeListing).length / pageSize),
                          }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`w-8 h-8 rounded-full text-xs font-semibold transition ${
                                currentPage === i + 1
                                  ? "bg-black text-white"
                                  : "hover:bg-gray-100 text-[#222222]"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button
                            disabled={
                              currentPage === Math.ceil(listings.filter(isHomeListing).length / pageSize)
                            }
                            onClick={() =>
                              setCurrentPage((p) =>
                                Math.min(
                                  Math.ceil(listings.filter(isHomeListing).length / pageSize),
                                  p + 1
                                )
                              )
                            }
                            className="px-4 py-2 border border-gray-300 rounded-full text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:border-black transition"
                          >
                            Next
                          </button>
                        </div>
                        <p className="text-xs text-[#717171]">
                          Showing {(currentPage - 1) * pageSize + 1} –{" "}
                          {Math.min(currentPage * pageSize, listings.filter(isHomeListing).length)} of{" "}
                          {listings.filter(isHomeListing).length} stays
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* If in ALL tab: also show Experiences & Photography sections underneath */}
            {activeNavTab === "all" && (
              <>
                {/* Popular experiences in New Delhi */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      onClick={() => setActiveNavTab("experiences")}
                      className="flex items-center gap-2 group cursor-pointer"
                    >
                      <h2 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                        Popular experiences in New Delhi
                      </h2>
                      <ArrowRight className="w-5 h-5 text-[#222222] transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                    {listings.filter((l) => l.property_type === "Experience").slice(0, 6).map((item) => (
                      <ListingCard
                        key={item.id}
                        listing={item}
                        isWishlisted={wishlistIds.includes(item.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                </div>

                {/* Photography Services */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      onClick={() => setActiveNavTab("services")}
                      className="flex items-center gap-2 group cursor-pointer"
                    >
                      <h2 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                        Photography
                      </h2>
                      <ArrowRight className="w-5 h-5 text-[#222222] transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                    {(serviceListings.filter((l) => l.id.startsWith("srv_photo")).length > 0
                      ? serviceListings.filter((l) => l.id.startsWith("srv_photo"))
                      : fallbackPhotoServices
                    ).map((item) => (
                      <ListingCard
                        key={item.id}
                        listing={item}
                        isWishlisted={wishlistIds.includes(item.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: SERVICES TAB (rec6.mp4.mp4 frame_02.0s & 22.0s)   */}
        {/* ======================================================== */}
        {activeNavTab === "services" && (
          <div className="space-y-10">
            {/* 3D Category Capsules from rec6.mp4.mp4 frame_02.0s & frame_14.0s */}
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[
                  { id: "photography", name: "Photography", icon: "📷", sub: "3D camera" },
                  { id: "chefs", name: "Chefs", icon: "🔪", sub: "3D knife" },
                  { id: "training", name: "Training", icon: "🏋️", sub: "3D kettlebell" },
                  { id: "makeup", name: "Make-up", icon: "💄", sub: "3D lipstick" },
                  { id: "hair", name: "Hair", icon: "💇", sub: "3D hairdryer" },
                ].map((cat) => {
                  const isSelected = selectedServiceCategory === cat.name;
                  return (
                    <div
                      key={cat.id}
                      onClick={() =>
                        setSelectedServiceCategory(isSelected ? null : cat.name)
                      }
                      className={`p-6 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group border ${isSelected
                        ? "bg-slate-100 border-black shadow-sm"
                        : "bg-[#F7F7F7] border-transparent hover:bg-slate-100 hover:shadow-xs"
                        }`}
                    >
                      <span className="text-5xl sm:text-6xl mb-3 group-hover:scale-110 transition-transform select-none">
                        {cat.icon}
                      </span>
                      <span
                        className={`text-sm ${isSelected ? "font-bold text-black" : "font-semibold text-[#222222]"
                          }`}
                      >
                        {cat.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CASE 1: SPECIFIC CATEGORY SELECTED - e.g. HAIR (rec6.mp4.mp4 frame_22.0s) */}
            {selectedServiceCategory === "Hair" ? (
              <div className="space-y-6">
                {/* Filter Pills row from rec6.mp4.mp4 frame_22.0s */}
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  <button className="flex items-center gap-2 py-2 px-3.5 rounded-full border border-gray-300 text-xs font-semibold hover:border-black cursor-pointer transition active:scale-95 bg-white">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filters</span>
                  </button>
                  <button className="py-2 px-3.5 rounded-full border border-black text-xs font-semibold hover:bg-gray-50 cursor-pointer flex items-center gap-1.5 bg-neutral-100">
                    <span>Hair</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button className="py-2 px-3.5 rounded-full border border-gray-300 text-xs font-semibold hover:border-black cursor-pointer flex items-center gap-1.5 bg-white">
                    <span>Time of day</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-[#222222]">
                  Explore 5 hair services
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {(serviceListings.filter(
                    (l) => l.id.startsWith("srv_hair") || l.id === "6436959"
                  ).length > 0
                    ? serviceListings.filter(
                      (l) => l.id.startsWith("srv_hair") || l.id === "6436959"
                    )
                    : fallbackHairServices
                  ).map((item) => (
                    <ListingCard
                      key={item.id}
                      listing={item}
                      isWishlisted={wishlistIds.includes(item.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* CASE 2: ALL SERVICES OVERVIEW (rec6.mp4.mp4 frame_02.0s) */
              <div className="space-y-12">
                {/* 1. Photography Section */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      onClick={() => setSelectedServiceCategory("Photography")}
                      className="flex items-center gap-2 group cursor-pointer"
                    >
                      <h3 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                        Photography
                      </h3>
                      <ArrowRight className="w-5 h-5 text-[#222222] transition-transform group-hover:translate-x-1" />
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-gray-400 hover:text-black transition cursor-pointer">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-black transition cursor-pointer">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                    {(serviceListings.filter((l) => l.id.startsWith("srv_photo")).length > 0
                      ? serviceListings.filter((l) => l.id.startsWith("srv_photo"))
                      : fallbackPhotoServices
                    ).map((item) => (
                      <ListingCard
                        key={item.id}
                        listing={item}
                        isWishlisted={wishlistIds.includes(item.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                </div>

                {/* 2. Training Section */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      onClick={() => setSelectedServiceCategory("Training")}
                      className="flex items-center gap-2 group cursor-pointer"
                    >
                      <h3 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                        Training
                      </h3>
                      <ArrowRight className="w-5 h-5 text-[#222222] transition-transform group-hover:translate-x-1" />
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-gray-400 hover:text-black transition cursor-pointer">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-black transition cursor-pointer">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                    {(serviceListings.filter((l) => l.id.startsWith("srv_train")).length > 0
                      ? serviceListings.filter((l) => l.id.startsWith("srv_train"))
                      : fallbackTrainServices
                    ).map((item) => (
                      <ListingCard
                        key={item.id}
                        listing={item}
                        isWishlisted={wishlistIds.includes(item.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. Hair Services Section */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      onClick={() => setSelectedServiceCategory("Hair")}
                      className="flex items-center gap-2 group cursor-pointer"
                    >
                      <h3 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                        Explore 5 hair services
                      </h3>
                      <ArrowRight className="w-5 h-5 text-[#222222] transition-transform group-hover:translate-x-1" />
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-gray-400 hover:text-black transition cursor-pointer">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-black transition cursor-pointer">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {(serviceListings.filter(
                      (l) => l.id.startsWith("srv_hair") || l.id === "6436959"
                    ).length > 0
                      ? serviceListings.filter(
                        (l) => l.id.startsWith("srv_hair") || l.id === "6436959"
                      )
                      : fallbackHairServices
                    ).map((item) => (
                      <ListingCard
                        key={item.id}
                        listing={item}
                        isWishlisted={wishlistIds.includes(item.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: EXPERIENCES TAB (rec5.mp4.mp4 frame_02s to 06s)   */}
        {/* ======================================================== */}
        {activeNavTab === "experiences" && (
          <div className="space-y-10">
            {/* Search reminder banner (rec5.mp4.mp4 frame_06.0s) */}
            <div className="flex items-center gap-3.5 bg-white border border-[#EBEBEB] hover:shadow-md rounded-2xl p-3 w-fit cursor-pointer transition">
              <img
                src="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=100"
                alt="Delhi tour"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="text-sm font-semibold text-[#222222]">
                Continue searching for experiences in New Delhi · 26 Sept →
              </span>
            </div>

            {/* Filter Pills from rec5.mp4.mp4 frame_02.0s */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 py-2.5 px-4 rounded-full border border-gray-300 text-xs font-semibold hover:border-black cursor-pointer transition active:scale-95 whitespace-nowrap"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
              <button className="py-2.5 px-4 rounded-full border border-gray-300 text-xs font-semibold hover:border-black cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                <span>🪄</span>
                <span>Originals</span>
              </button>
              <button className="py-2.5 px-4 rounded-full border border-gray-300 text-xs font-semibold hover:border-black cursor-pointer whitespace-nowrap">
                Type ▾
              </button>
              <button className="py-2.5 px-4 rounded-full border border-gray-300 text-xs font-semibold hover:border-black cursor-pointer whitespace-nowrap">
                Time of day ▾
              </button>
            </div>

            {/* Section 1: All experiences in New Delhi (rec5.mp4.mp4 frame_02.0s & frame_06.0s) */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                    Popular experiences in New Delhi
                  </h3>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-gray-400 hover:text-black transition cursor-pointer">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-black transition cursor-pointer">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                {(listings.filter((l) => l.property_type === "Experience").length > 0
                  ? listings.filter((l) => l.property_type === "Experience")
                  : listings.slice(0, 6)
                ).map((item) => (
                  <ListingCard
                    key={item.id}
                    listing={item}
                    isWishlisted={wishlistIds.includes(item.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </div>

            {/* Section 2: Airbnb Originals (rec5.mp4.mp4 frame_06.0s) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                    Airbnb Originals
                  </h3>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-gray-400 hover:text-black transition cursor-pointer">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-black transition cursor-pointer">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-[#717171] mb-5">
                Hosted by the world&apos;s most interesting people
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {[
                  {
                    id: "exp_delhi_1",
                    title: "Paint at Art Basel Paris with a renowned artist",
                    city: "Paris, France",
                    property_type: "Experience",
                    category: "originals",
                    price_per_night: 10932,
                    cover_image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
                    images: ["https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"],
                    average_rating: 5.0,
                    review_count: 24,
                    is_guest_favourite: true,
                  },
                  {
                    id: "exp_delhi_2",
                    title: "Carve marble with a third-generation sculptor",
                    city: "Athens, Greece",
                    property_type: "Experience",
                    category: "originals",
                    price_per_night: 6559,
                    cover_image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
                    images: ["https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"],
                    average_rating: 5.0,
                    review_count: 42,
                    is_guest_favourite: true,
                  },
                  {
                    id: "exp_delhi_3",
                    title: "Savor Premium Matcha in a tea ceremony in Shibuya",
                    city: "Shibuya, Japan",
                    property_type: "Experience",
                    category: "originals",
                    price_per_night: 4236,
                    cover_image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
                    images: ["https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80"],
                    average_rating: 5.0,
                    review_count: 88,
                    is_guest_favourite: true,
                  },
                  {
                    id: "exp_delhi_4",
                    title: "Craft a Georgia peach with a pro glassblower",
                    city: "Atlanta, United States",
                    property_type: "Experience",
                    category: "originals",
                    price_per_night: 8073,
                    cover_image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80",
                    images: ["https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80"],
                    average_rating: 4.99,
                    review_count: 67,
                    is_guest_favourite: true,
                  },
                  {
                    id: "exp_delhi_5",
                    title: "Insider's Food Tour: South Philly & Italian Market",
                    city: "Philadelphia, United States",
                    property_type: "Experience",
                    category: "originals",
                    price_per_night: 9899,
                    cover_image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
                    images: ["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"],
                    average_rating: 5.0,
                    review_count: 112,
                    is_guest_favourite: true,
                  },
                ].map((item: any) => (
                  <ListingCard
                    key={item.id}
                    listing={item}
                    isWishlisted={wishlistIds.includes(item.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </div>

            {/* Section 3: Popular with travellers from your area (rec5.mp4.mp4 frame_02.0s) */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                  Experiences in Gurgaon District →
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                {(listings.filter((l) => l.city.toLowerCase() === "gurgaon").length > 0
                  ? listings.filter((l) => l.city.toLowerCase() === "gurgaon")
                  : listings.slice(0, 6)
                ).map((item) => (
                  <ListingCard
                    key={item.id}
                    listing={item}
                    isWishlisted={wishlistIds.includes(item.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

      </main>



      {/* Currency Modal (frame_048s.jpg) */}
      <CurrencyModal
        isOpen={isCurrencyOpen}
        onClose={() => setIsCurrencyOpen(false)}
        selectedCurrency="INR"
        onSelectCurrency={() => { }}
      />

      {/* Promo Modal */}
      <PromoModal
        isOpen={isPromoOpen}
        onClose={handleClosePromo}
        onClaim={() => setIsAuthOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onUserLoggedIn={(u) => {
          setCurrentUser(u);
          loadData();
        }}
      />

      {/* Filter Modal with click-anywhere-outside to close */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialFilters={activeFilters}
        onApply={(filters) => {
          setActiveFilters(filters);
        }}
      />

      {/* Inspiration for future getaways (matches frame_014s.jpg / frame_016s.jpg) */}
      <InspirationSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}

/* ─────────── Inspiration for future getaways ─────────── */
type InspirationTab = "Popular" | "Arts & culture" | "Beach" | "Mountains" | "Outdoors" | "Things to do";

const INSPIRATION_DATA: Record<InspirationTab, { city: string; type: string }[]> = {
  "Popular": [
    { city: "Portland", type: "Cottage rentals" },
    { city: "Amsterdam", type: "Flat rentals" },
    { city: "Dallas", type: "Villa rentals" },
    { city: "Kauai", type: "Flat rentals" },
    { city: "Madrid", type: "Monthly Rentals" },
    { city: "Gulf Shores", type: "Villa rentals" },
    { city: "San Jose", type: "Holiday rentals" },
    { city: "Barcelona", type: "Apartment rentals" },
    { city: "Portland", type: "Villa rentals" },
    { city: "Minneapolis", type: "House rentals" },
    { city: "Raleigh", type: "Apartment rentals" },
    { city: "Memphis", type: "Monthly Rentals" },
    { city: "Oahu", type: "Villa rentals" },
    { city: "San Juan", type: "House rentals" },
    { city: "Nashville", type: "Cabin rentals" },
    { city: "Santo Domingo", type: "House rentals" },
    { city: "Cincinnati", type: "Cabin rentals" },
    { city: "Show more", type: "" },
  ],
  "Arts & culture": [
    { city: "Paris", type: "House rentals" },
    { city: "Anza-Borrego Desert State...", type: "House rentals" },
    { city: "Lambeau Field", type: "Holiday rentals" },
    { city: "Canal Saint-Martin", type: "Apartment rentals" },
    { city: "Assateague Island", type: "House rentals" },
    { city: "University of Southern Calif...", type: "Holiday rentals" },
    { city: "Lake Bled", type: "Flat rentals" },
    { city: "Covent Garden", type: "House rentals" },
    { city: "Playa Venao", type: "Villa rentals" },
    { city: "Everglades", type: "Villa rentals" },
    { city: "Ruby Falls", type: "Cabin rentals" },
    { city: "Peanut Island", type: "Flat rentals" },
    { city: "Valle Nevado Ski Resort", type: "Holiday rentals" },
    { city: "The Royal Mile", type: "Apartment rentals" },
    { city: "Lake Wawasee", type: "House rentals" },
    { city: "Lake Como", type: "Cabin rentals" },
    { city: "Príncipe Real", type: "Holiday rentals" },
    { city: "Show more", type: "" },
  ],
  "Beach": [
    { city: "Malibu", type: "Beach house rentals" },
    { city: "Destin", type: "Beach rentals" },
    { city: "Outer Banks", type: "House rentals" },
    { city: "Tulum", type: "Villa rentals" },
    { city: "Santorini", type: "Holiday rentals" },
    { city: "Phuket", type: "Villa rentals" },
    { city: "Miami Beach", type: "Condo rentals" },
    { city: "Mykonos", type: "Holiday rentals" },
    { city: "Bali", type: "Villa rentals" },
    { city: "Costa Rica", type: "Holiday rentals" },
    { city: "Cancún", type: "Resort rentals" },
    { city: "Maui", type: "Condo rentals" },
    { city: "Cape Cod", type: "Cottage rentals" },
    { city: "Turks and Caicos", type: "Villa rentals" },
    { city: "Amalfi Coast", type: "Holiday rentals" },
    { city: "Ibiza", type: "Villa rentals" },
    { city: "Hawaii", type: "Holiday rentals" },
    { city: "Show more", type: "" },
  ],
  "Mountains": [
    { city: "Aspen", type: "Cabin rentals" },
    { city: "Banff", type: "Cottage rentals" },
    { city: "Telluride", type: "Cabin rentals" },
    { city: "Lake Tahoe", type: "Cabin rentals" },
    { city: "Swiss Alps", type: "Chalet rentals" },
    { city: "Park City", type: "Cabin rentals" },
    { city: "Whistler", type: "Chalet rentals" },
    { city: "Colorado Rockies", type: "Cabin rentals" },
    { city: "Blue Ridge Mountains", type: "Cabin rentals" },
    { city: "Queenstown", type: "Holiday rentals" },
    { city: "Interlaken", type: "Holiday rentals" },
    { city: "Zermatt", type: "Chalet rentals" },
    { city: "Patagonia", type: "Cottage rentals" },
    { city: "Yosemite", type: "Cabin rentals" },
    { city: "Jackson Hole", type: "Cabin rentals" },
    { city: "Dolomites", type: "Holiday rentals" },
    { city: "Verbier", type: "Chalet rentals" },
    { city: "Show more", type: "" },
  ],
  "Outdoors": [
    { city: "Grand Canyon", type: "Cabin rentals" },
    { city: "Sedona", type: "Holiday rentals" },
    { city: "Yellowstone", type: "Cabin rentals" },
    { city: "Smoky Mountains", type: "Cabin rentals" },
    { city: "Zion National Park", type: "Holiday rentals" },
    { city: "Big Sur", type: "Cottage rentals" },
    { city: "Glacier National Park", type: "Holiday rentals" },
    { city: "Acadia", type: "Cottage rentals" },
    { city: "Ozarks", type: "Cabin rentals" },
    { city: "Columbia River Gorge", type: "House rentals" },
    { city: "Olympic Peninsula", type: "Cabin rentals" },
    { city: "Shenandoah Valley", type: "Cottage rentals" },
    { city: "Black Hills", type: "Cabin rentals" },
    { city: "Boundary Waters", type: "Cabin rentals" },
    { city: "Finger Lakes", type: "Cottage rentals" },
    { city: "Adirondacks", type: "Cabin rentals" },
    { city: "Cascade Range", type: "Holiday rentals" },
    { city: "Show more", type: "" },
  ],
  "Things to do": [
    { city: "New York City", type: "Apartment rentals" },
    { city: "London", type: "Flat rentals" },
    { city: "Tokyo", type: "Holiday rentals" },
    { city: "Barcelona", type: "Apartment rentals" },
    { city: "Rome", type: "Holiday rentals" },
    { city: "Dubai", type: "Villa rentals" },
    { city: "Sydney", type: "Holiday rentals" },
    { city: "Amsterdam", type: "Flat rentals" },
    { city: "Bangkok", type: "Holiday rentals" },
    { city: "Singapore", type: "Holiday rentals" },
    { city: "Prague", type: "Apartment rentals" },
    { city: "Vienna", type: "Apartment rentals" },
    { city: "Lisbon", type: "Flat rentals" },
    { city: "Copenhagen", type: "Flat rentals" },
    { city: "Budapest", type: "Apartment rentals" },
    { city: "Istanbul", type: "Holiday rentals" },
    { city: "Berlin", type: "Apartment rentals" },
    { city: "Show more", type: "" },
  ],
};

function InspirationSection() {
  const [activeTab, setActiveTab] = React.useState<InspirationTab>("Popular");
  const [showAll, setShowAll] = React.useState(false);
  const tabs: InspirationTab[] = ["Popular", "Arts & culture", "Beach", "Mountains", "Outdoors", "Things to do"];
  const items = INSPIRATION_DATA[activeTab];
  // Show 3 rows of 6 = 18 items (last is "Show more"), visible items without show more
  const displayItems = items.filter(i => i.city !== "Show more");
  const visibleItems = showAll ? displayItems : displayItems.slice(0, 15);

  return (
    <section className="bg-[#F7F7F7] px-6 sm:px-10 lg:px-16 py-12">
      <div className="max-w-[1760px] mx-auto">
        <h2 className="text-[22px] font-semibold text-[#222222] mb-5">Inspiration for future getaways</h2>

        {/* Tab row */}
        <div className="flex items-center gap-0 border-b border-[#DDDDDD] mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setShowAll(false); }}
              className={`pb-3 mr-6 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab
                ? "border-[#222222] text-[#222222]"
                : "border-transparent text-[#717171] hover:text-[#222222]"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 6-column link grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-5">
          {visibleItems.map((item, idx) => (
            <div key={idx} className="cursor-pointer group">
              <p className="text-[14px] font-semibold text-[#222222] group-hover:underline leading-tight">{item.city}</p>
              <p className="text-[13px] text-[#717171] mt-0.5">{item.type}</p>
            </div>
          ))}
          {/* Show more / Show less */}
          {!showAll && displayItems.length > 15 && (
            <div
              className="cursor-pointer group col-span-1"
              onClick={() => setShowAll(true)}
            >
              <p className="text-[14px] font-semibold text-[#222222] group-hover:underline flex items-center gap-1">
                Show more <span className="text-xs">▾</span>
              </p>
            </div>
          )}
          {showAll && (
            <div
              className="cursor-pointer group col-span-1"
              onClick={() => setShowAll(false)}
            >
              <p className="text-[14px] font-semibold text-[#222222] group-hover:underline flex items-center gap-1">
                Show less <span className="text-xs">▴</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
