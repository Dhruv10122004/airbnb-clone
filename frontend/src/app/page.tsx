"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchCapsule from "@/components/SearchCapsule";
import CategoryBar from "@/components/CategoryBar";
import ListingCard from "@/components/ListingCard";
import FilterModal from "@/components/FilterModal";
import AuthModal from "@/components/AuthModal";
import CurrencyModal from "@/components/CurrencyModal";
import PromoModal from "@/components/PromoModal";
import Footer from "@/components/Footer";
import { ListingSummary, User } from "@/types";
import {
  fetchListings,
  fetchCurrentUser,
  fetchWishlistIds,
  toggleWishlist,
} from "@/lib/api";
import { Map, ArrowRight } from "lucide-react";

export default function HomePage() {
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  
  // Navigation & Category State
  const [activeNavTab, setActiveNavTab] = useState<"all" | "homes" | "experiences" | "services">("homes");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filters
  const [searchParams, setSearchParams] = useState<{
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }>({});
  const [filterParams, setFilterParams] = useState<{
    min_price?: number;
    max_price?: number;
    property_type?: string;
    amenities?: string;
  }>({});

  // Currency State
  const [currency, setCurrency] = useState("INR");
  const [currencySymbol, setCurrencySymbol] = useState("₹");

  // Modals
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  // Trigger Promo Modal once for logged-out users after 1.5 seconds
  useEffect(() => {
    const promoDismissed = sessionStorage.getItem("airbnb_promo_dismissed");
    if (!promoDismissed) {
      const timer = setTimeout(() => {
        setIsPromoOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePromo = () => {
    sessionStorage.setItem("airbnb_promo_dismissed", "true");
    setIsPromoOpen(false);
  };

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [allListings, user, wishIds] = await Promise.allSettled([
        fetchListings({
          category: selectedCategory,
          destination: searchParams.destination,
          check_in: searchParams.checkIn,
          check_out: searchParams.checkOut,
          guests: searchParams.guests,
          min_price: filterParams.min_price,
          max_price: filterParams.max_price,
          property_type: filterParams.property_type,
          amenities: filterParams.amenities,
        }),
        fetchCurrentUser(),
        fetchWishlistIds(),
      ]);

      if (allListings.status === "fulfilled") setListings(allListings.value);
      if (user.status === "fulfilled") setCurrentUser(user.value);
      if (wishIds.status === "fulfilled") setWishlistIds(wishIds.value);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchParams, filterParams]);

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
    loadData();
  };

  // Group listings for the authentic Airbnb section headers
  const noidaHomes = listings.filter((l) => l.city.toLowerCase() === "noida");
  const gurgaonHomes = listings.filter((l) => l.city.toLowerCase() === "gurgaon");
  const otherHomes = listings.filter(
    (l) => l.city.toLowerCase() !== "noida" && l.city.toLowerCase() !== "gurgaon"
  );

  const activeFiltersCount =
    (filterParams.min_price ? 1 : 0) +
    (filterParams.max_price ? 1 : 0) +
    (filterParams.property_type ? 1 : 0) +
    (filterParams.amenities ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. Top Navbar with Center Tabs */}
      <Navbar
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenCurrencyModal={() => setIsCurrencyOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        activeNavTab={activeNavTab}
        onSelectNavTab={setActiveNavTab}
      />

      {/* 2. Hero Search Bar Section (Centered directly below Navbar) */}
      <div className="bg-white border-b border-[#EBEBEB] pb-5 pt-3 px-4 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <SearchCapsule onSearch={setSearchParams} />
      </div>

      {/* 3. Category Icon Bar */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenFilter={() => setIsFilterOpen(true)}
        filterCount={activeFiltersCount}
      />

      {/* 4. Main Content Area */}
      <main className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-16 py-8 flex-1 w-full">
        {loading ? (
          // Skeleton Loader
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-[20/19] bg-neutral-200 rounded-2xl" />
                <div className="h-4 bg-neutral-200 rounded-md w-3/4" />
                <div className="h-3 bg-neutral-200 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-[#222222]">No stays found</h3>
            <p className="text-sm text-[#717171] mt-2">
              Try adjusting your search criteria or resetting filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchParams({});
                setFilterParams({});
              }}
              className="mt-5 px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-full hover:bg-neutral-800 transition cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Section 1: Popular homes in Noida (matches screenshot) */}
            {noidaHomes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-5 group cursor-pointer w-fit">
                  <h2 className="text-xl font-bold text-[#222222] tracking-tight">
                    Popular homes in Noida
                  </h2>
                  <ArrowRight className="w-5 h-5 text-[#222222] transition-transform group-hover:translate-x-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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

            {/* Section 2: Available in Gurgaon District this weekend (matches screenshot) */}
            {gurgaonHomes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-5 group cursor-pointer w-fit">
                  <h2 className="text-xl font-bold text-[#222222] tracking-tight">
                    Available in Gurgaon District this weekend
                  </h2>
                  <ArrowRight className="w-5 h-5 text-[#222222] transition-transform group-hover:translate-x-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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

            {/* Section 3: Other Iconic Stays & Getaways */}
            {otherHomes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-5 group cursor-pointer w-fit">
                  <h2 className="text-xl font-bold text-[#222222] tracking-tight">
                    Iconic Stays & Vacation Escapes
                  </h2>
                  <ArrowRight className="w-5 h-5 text-[#222222] transition-transform group-hover:translate-x-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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

          </div>
        )}
      </main>

      {/* Floating Bottom Center "Show Map" Pill Button (Airbnb Signature) */}
      <div className="fixed bottom-8 inset-x-0 flex justify-center z-30 pointer-events-none">
        <button
          onClick={() => setShowMapModal(true)}
          className="pointer-events-auto bg-[#222222] hover:bg-black text-white text-sm font-semibold py-3 px-5 rounded-full flex items-center gap-2 shadow-[0_6px_20px_rgba(0,0,0,0.25)] hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          <span>Show map</span>
          <Map className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Map Modal with Price Pins */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[80vh] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="p-4 border-b border-[#EBEBEB] flex items-center justify-between">
              <h3 className="font-bold text-[#222222] flex items-center gap-2">
                <Map className="w-5 h-5 text-[#FF385C]" />
                <span>Explore Stays on Map</span>
              </h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-sm font-semibold text-[#717171] hover:text-black py-1 px-3 border border-gray-200 rounded-full cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="flex-1 bg-slate-100 relative p-6 overflow-y-auto">
              <div className="w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] rounded-2xl border border-gray-200 relative flex items-center justify-center">
                <div className="absolute inset-0 p-6 flex flex-wrap gap-4 items-center justify-around">
                  {listings.map((item) => (
                    <div
                      key={item.id}
                      className="group/pin relative bg-white hover:bg-black hover:text-white text-[#222222] font-bold text-xs py-1.5 px-3 rounded-full shadow-lg border border-gray-300 transition-all transform hover:scale-110 cursor-pointer"
                    >
                      <span>₹{item.price_per_night.toLocaleString("en-IN")}</span>
                      {/* Mini preview card on pin hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 p-2 hidden group-hover/pin:block text-black z-50 pointer-events-none">
                        <img
                          src={item.cover_image}
                          alt={item.title}
                          className="w-full h-24 object-cover rounded-lg mb-1"
                        />
                        <p className="text-[11px] font-bold truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-500">★ {item.average_rating} · {item.city}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={setFilterParams}
        initialFilters={filterParams}
      />

      {/* Currency Modal (Section 5) */}
      <CurrencyModal
        isOpen={isCurrencyOpen}
        onClose={() => setIsCurrencyOpen(false)}
        selectedCurrency={currency}
        onSelectCurrency={(code, sym) => {
          setCurrency(code);
          setCurrencySymbol(sym);
        }}
      />

      {/* Promo Modal (Section 6) */}
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
