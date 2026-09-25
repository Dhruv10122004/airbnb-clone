"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Heart,
  Share,
  Grid,
  MapPin,
  Shield,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Key,
  MessageSquare,
  Tag,
  Compass,
  Award,
  Waves,
  Calendar as CalendarIcon,
  Search,
  Flag,
  Coffee,
  Wifi,
  Tv,
  Car,
  Wind,
  ShieldAlert,
  Flame,
  UtensilsCrossed,
  Briefcase,
  Layers,
  Sparkles,
  Clock,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CurrencyModal from "@/components/CurrencyModal";
import ServiceDetailView from "@/components/ServiceDetailView";
import { ListingDetail, User } from "@/types";
import {
  fetchListingById,
  fetchCurrentUser,
  createBooking,
  toggleWishlist,
  addReview,
} from "@/lib/api";

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dates state
  const [checkIn, setCheckIn] = useState<string>("2026-10-09");
  const [checkOut, setCheckOut] = useState<string>("2026-10-11");
  const [guestCount, setGuestCount] = useState<number>(1);
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);

  // Calendar and amenities interactive state
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(2026, 9, 1));
  const [showAllAmenities, setShowAllAmenities] = useState<boolean>(false);

  // UI state
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [activeTab, setActiveTab] = useState<"photos" | "amenities" | "reviews" | "location">("photos");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedMention, setSelectedMention] = useState<string | null>(null);

  // Booking CTA state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Check if a date string YYYY-MM-DD is booked
  const isDateBooked = (dateStr: string) => {
    if (!listing?.booked_dates) return false;
    return listing.booked_dates.some((b) => {
      return dateStr >= b.check_in && dateStr < b.check_out;
    });
  };

  const handleDateClick = (dateStr: string) => {
    if (isDateBooked(dateStr)) return;
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut("");
    } else if (checkIn && !checkOut) {
      if (dateStr <= checkIn) {
        setCheckIn(dateStr);
      } else {
        const hasBookedBetween = listing?.booked_dates?.some((b) => {
          return b.check_in > checkIn && b.check_in < dateStr;
        });
        if (hasBookedBetween) {
          setCheckIn(dateStr);
        } else {
          setCheckOut(dateStr);
        }
      }
    }
  };

  const getMonthDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: { day: number; dateStr: string }[] = [];
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, dateStr });
    }
    return { firstDay, days };
  };

  const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("wifi") || lower.includes("internet")) return <Wifi className="w-5 h-5 text-[#222222]" />;
    if (lower.includes("pool")) return <Waves className="w-5 h-5 text-[#222222]" />;
    if (lower.includes("air") || lower.includes("ac") || lower.includes("cooling")) return <Wind className="w-5 h-5 text-[#222222]" />;
    if (lower.includes("kitchen") || lower.includes("cook")) return <UtensilsCrossed className="w-5 h-5 text-[#222222]" />;
    if (lower.includes("park")) return <Car className="w-5 h-5 text-[#222222]" />;
    if (lower.includes("tv")) return <Tv className="w-5 h-5 text-[#222222]" />;
    if (lower.includes("work") || lower.includes("desk")) return <Briefcase className="w-5 h-5 text-[#222222]" />;
    if (lower.includes("coffee") || lower.includes("breakfast")) return <Coffee className="w-5 h-5 text-[#222222]" />;
    if (lower.includes("security") || lower.includes("camera")) return <ShieldAlert className="w-5 h-5 text-[#222222]" />;
    if (lower.includes("balcony") || lower.includes("patio") || lower.includes("view")) return <Compass className="w-5 h-5 text-[#222222]" />;
    if (lower.includes("hairdryer") || lower.includes("dryer")) return <Wind className="w-5 h-5 text-[#222222]" />;
    if (lower.includes("alarm") || lower.includes("fire") || lower.includes("grill")) return <Flame className="w-5 h-5 text-[#222222]" />;
    return <Sparkles className="w-5 h-5 text-[#222222]" />;
  };

  const fallbackReviews: any[] = [
    {
      id: "fb_1",
      author: {
        full_name: "Ankesh",
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      },
      created_at: "2026-09-10T10:00:00Z",
      rating_overall: 5.0,
      comment: "It was a super comfy stay with vintage vibe. Location is great, close to mall and restaurants. Surely in my wish-list to come back.",
    },
    {
      id: "fb_2",
      author: {
        full_name: "Shriya",
        avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      },
      created_at: "2026-09-08T10:00:00Z",
      rating_overall: 5.0,
      comment: "The place was soo good and clean. Exactly how the host described and presented. Thank you for the wonderful and smooth stay.",
    },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [detail, user] = await Promise.all([
        fetchListingById(id),
        fetchCurrentUser().catch(() => null),
      ]);
      setListing(detail);
      setCurrentUser(user);
    } catch (err: any) {
      setError(err.message || "Failed to load listing details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  // Track scroll position for sticky sub-header
  useEffect(() => {
    const handleScroll = () => {
      setScrolledPastHero(window.scrollY > 560);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggleWishlist = async () => {
    if (!listing) return;
    try {
      const res = await toggleWishlist(listing.id);
      setIsWishlisted(res.is_saved);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateTotals = useMemo(() => {
    if (!listing || !checkIn || !checkOut) return null;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    if (diffTime <= 0) return null;

    const basePrice = nights * listing.price_per_night;
    const cleaningFee = listing.cleaning_fee || 600;
    const serviceFee = Math.round(basePrice * (listing.service_fee_percent / 100));
    const total = basePrice + cleaningFee + serviceFee;

    return { nights, basePrice, cleaningFee, serviceFee, total };
  }, [listing, checkIn, checkOut]);

  const handleReserve = async () => {
    if (!listing) return;
    setBookingLoading(true);
    setBookingError(null);
    try {
      const res = await createBooking({
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guest_count: guestCount,
      });
      setConfirmedBooking(res);
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      setBookingError(err.message || "Booking reservation failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await addReview(id, {
        rating_overall: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewComment("");
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar onOpenAuthModal={() => setIsAuthOpen(true)} currentUser={currentUser} onLogout={() => {}} />
        <div className="max-w-[1280px] mx-auto px-6 py-10 w-full animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded-lg w-2/3" />
          <div className="aspect-[2/1] bg-neutral-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar onOpenAuthModal={() => setIsAuthOpen(true)} currentUser={currentUser} onLogout={() => {}} />
        <div className="max-w-md mx-auto py-24 text-center">
          <h2 className="text-xl font-bold text-red-500">Listing Not Found</h2>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
          <Link href="/" className="inline-block mt-4 px-6 py-2 bg-black text-white rounded-full text-sm font-semibold">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isService =
    listing.property_type === "Service" ||
    listing.category === "services" ||
    id.startsWith("srv_") ||
    id === "6436959";

  if (isService) {
    return (
      <>
        <ServiceDetailView
          listing={listing}
          currentUser={currentUser}
          isWishlisted={isWishlisted}
          onToggleWishlist={async () => {
            if (!currentUser) {
              setIsAuthOpen(true);
              return;
            }
            await toggleWishlist(id);
            setIsWishlisted(!isWishlisted);
          }}
          onOpenAuthModal={() => setIsAuthOpen(true)}
          onOpenCurrencyModal={() => setIsCurrencyOpen(true)}
          onLogout={() => {
            localStorage.removeItem("airbnb_user_id");
            setCurrentUser(null);
            loadData();
          }}
        />
        {isAuthOpen && (
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onSuccess={() => {
              setIsAuthOpen(false);
              loadData();
            }}
          />
        )}
        {isCurrencyOpen && (
          <CurrencyModal
            isOpen={isCurrencyOpen}
            onClose={() => setIsCurrencyOpen(false)}
            selectedCurrency="INR"
            onSelectCurrency={() => setIsCurrencyOpen(false)}
          />
        )}
      </>
    );
  }

  const isExperience =
    listing.property_type === "Experience" ||
    listing.category === "experiences" ||
    listing.category === "originals";

  const images = listing.images?.length
    ? listing.images.map((img) => img.url)
    : [
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
      ];

  const experienceDateSlots = [
    { label: "Tomorrow, 26 September", time: "2:30 – 4:30 am" },
    { label: "Sunday, 27 September", time: "2:30 – 4:30 am" },
    { label: "Monday, 28 September", time: "2:30 – 4:30 am" },
    { label: "Tuesday, 29 September", time: "2:30 – 4:30 am" },
    { label: "Wednesday, 30 September", time: "2:30 – 4:30 am" },
  ];

  const experienceReviews = [
    {
      name: "Cj",
      location: "Philippines",
      date: "1 day ago",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      text: "Amazing day tour to Taj Mahal and Agra Fort! Uvais was incredibly knowledgeable, friendly, and helped us take the best photos.",
    },
    {
      name: "D",
      location: "Hyattsville, MD",
      date: "1 day ago",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      text: "Everything was perfectly organized. The private AC car was smooth and comfortable. Taj Mahal was breathtaking.",
    },
    {
      name: "Vishal",
      location: "Guwahati, India",
      date: "2 weeks ago",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      text: "Driver and guides were very friendly and polite. Skip the line entry saved so much time! Highly recommended.",
    },
    {
      name: "Sobe",
      location: "Chicago, IL",
      date: "3 weeks ago",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
      text: "Our host was very patient and kept me company while my family took a ton of pictures. He was intentional and didn't pressure us to do anything.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. Main Navbar */}
      <Navbar
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenCurrencyModal={() => setIsCurrencyOpen(true)}
        currentUser={currentUser}
        onLogout={() => {
          localStorage.removeItem("airbnb_user_id");
          setCurrentUser(null);
          loadData();
        }}
        activeNavTab={isExperience ? "experiences" : "homes"}
      />

      {/* ========================================================================= */}
      {/* CASE A: EXPERIENCE DETAIL LAYOUT (rec5.mp4.mp4 frame_10.0s to 30.0s)      */}
      {/* ========================================================================= */}
      {isExperience ? (
        <main className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-20 py-8 w-full flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: 2x2 Photo Grid, Timeline, Reviews, Meeting Map, Wax Seal */}
            <div className="lg:col-span-7 space-y-10">
              
              {/* 2x2 Photo Grid (rec5.mp4.mp4 frame_10.0s) */}
              <div
                onClick={() => setIsGalleryOpen(true)}
                className="grid grid-cols-2 gap-2.5 rounded-2xl overflow-hidden cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                  <img
                    src={images[0]}
                    alt="Experience 1"
                    className="w-full h-full object-cover hover:scale-103 transition duration-300"
                  />
                </div>
                <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                  <img
                    src={images[1] || images[0]}
                    alt="Experience 2"
                    className="w-full h-full object-cover hover:scale-103 transition duration-300"
                  />
                </div>
                <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                  <img
                    src={images[2] || images[0]}
                    alt="Experience 3"
                    className="w-full h-full object-cover hover:scale-103 transition duration-300"
                  />
                </div>
                <div className="aspect-[4/3] overflow-hidden bg-neutral-100 relative">
                  <img
                    src={images[3] || images[0]}
                    alt="Experience 4"
                    className="w-full h-full object-cover hover:scale-103 transition duration-300"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsGalleryOpen(true);
                    }}
                    className="absolute bottom-3 right-3 bg-white/95 text-[#222222] font-semibold text-xs py-1.5 px-3 rounded-lg border border-black shadow-md flex items-center gap-1.5 z-10 cursor-pointer"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Show all</span>
                  </button>
                </div>
              </div>

              {/* "What you'll do" Timeline (rec5.mp4.mp4 frame_14.0s) */}
              <div className="pt-2 border-t border-[#EBEBEB]">
                <h3 className="text-2xl font-bold text-[#222222] mb-6">What you&apos;ll do</h3>
                <div className="space-y-6 relative before:absolute before:left-7 before:top-4 before:bottom-4 before:w-[2px] before:bg-gray-200">
                  <div className="flex items-start gap-5 relative">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-100 z-10 shadow-xs">
                      <img src={images[0]} alt="Step 1" className="w-full h-full object-cover" />
                    </div>
                    <div className="pt-1">
                      <h4 className="text-base font-bold text-[#222222]">Explore Agra Fort</h4>
                      <p className="text-sm text-[#717171] mt-0.5 leading-relaxed">
                        Discover the stunning Mughal architecture of Agra Fort with your personal historian guide.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 relative">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-100 z-10 shadow-xs">
                      <img src={images[1] || images[0]} alt="Step 2" className="w-full h-full object-cover" />
                    </div>
                    <div className="pt-1">
                      <h4 className="text-base font-bold text-[#222222]">Enjoy local cuisine</h4>
                      <p className="text-sm text-[#717171] mt-0.5 leading-relaxed">
                        Take time for breakfast or lunch on your own at an authentic Mughlai dining spot.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 relative">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-100 z-10 shadow-xs">
                      <img src={images[2] || images[0]} alt="Step 3" className="w-full h-full object-cover" />
                    </div>
                    <div className="pt-1">
                      <h4 className="text-base font-bold text-[#222222]">Return to Delhi</h4>
                      <p className="text-sm text-[#717171] mt-0.5 leading-relaxed">
                        After sightseeing, relax on the smooth ride back to your hotel or pickup location in Delhi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section (rec5.mp4.mp4 frame_14.0s & frame_26.0s) */}
              <div className="pt-8 border-t border-[#EBEBEB]">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-5 h-5 fill-black text-black" />
                  <h3 className="text-2xl font-bold text-[#222222]">
                    4.91 · 140 ratings
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {experienceReviews.map((rev, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.avatar}
                          alt={rev.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-[#222222]">{rev.name}</h4>
                          <p className="text-xs text-[#717171]">{rev.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#222222]">
                        <span className="font-bold">★★★★★</span>
                        <span>·</span>
                        <span className="text-[#717171]">{rev.date}</span>
                      </div>
                      <p className="text-sm text-[#222222] leading-relaxed">{rev.text}</p>
                      <button className="text-sm font-semibold underline text-[#222222] cursor-pointer">
                        Show more
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => alert("Showing all 140 ratings")}
                    className="border border-black hover:bg-[#F7F7F7] text-[#222222] font-semibold text-sm px-6 py-3 rounded-xl transition cursor-pointer"
                  >
                    Show all ratings
                  </button>
                  <p className="text-xs text-[#717171]">
                    Learn how ratings and reviews work · Some reviews have been automatically translated.
                  </p>
                </div>
              </div>

              {/* "Where we'll meet" (rec5.mp4.mp4 frame_18.0s) */}
              <div className="pt-8 border-t border-[#EBEBEB]">
                <h3 className="text-2xl font-bold text-[#222222] mb-1">Where we&apos;ll meet</h3>
                <p className="text-sm text-[#717171] mb-5">
                  {listing.address || "New Delhi, Delhi, 282001"}
                </p>

                <div className="aspect-[16/9] w-full bg-[#E5E3DF] rounded-3xl overflow-hidden relative border border-gray-200 shadow-xs flex items-center justify-center">
                  <iframe
                    title="Meeting Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=77.18%2C28.58%2C77.24%2C28.64&layer=mapnik&marker=28.6139%2C77.2090"
                    className="w-full h-full filter saturate-90 brightness-98"
                  />
                  <div className="absolute z-10 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-xl">
                      <MapPin className="w-5 h-5 fill-white text-white" />
                    </div>
                    <span className="mt-1 bg-white text-black font-bold text-xs px-2.5 py-1 rounded-md shadow-md border border-gray-100">
                      Meeting point
                    </span>
                  </div>
                </div>
              </div>

              {/* Gold Wax Seal Badge (rec5.mp4.mp4 frame_22.0s) */}
              <div className="pt-10 border-t border-[#EBEBEB] text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-400/90 text-white flex items-center justify-center mx-auto shadow-md border-2 border-amber-300">
                  <Award className="w-9 h-9 stroke-[2.5]" />
                </div>
                <h3 className="text-2xl font-bold text-[#222222]">
                  Landmark tours with knowledgeable hosts
                </h3>
                <p className="text-sm text-[#717171] max-w-lg mx-auto leading-relaxed">
                  Landmark tours are led by historians, archaeologists and other hosts who showcase what makes the city unique.
                </p>
                <div className="pt-4 border-t border-[#EBEBEB]">
                  <p className="text-xs text-[#717171]">
                    See an issue? <span className="underline cursor-pointer">Report this listing</span>
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Title Block, Host Meta, Sticky Slots Card (rec5.mp4.mp4 frame_10.0s to 14.0s) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Title Block */}
              <div>
                <h1 className="text-3xl font-bold text-[#222222] tracking-tight leading-tight">
                  {listing.title}
                </h1>
                <p className="text-sm text-[#717171] mt-2 leading-relaxed">
                  {listing.description.split(".")[0]}.
                </p>

                <div className="flex items-center gap-2 text-xs text-[#222222] mt-3">
                  <span className="font-semibold flex items-center gap-1">
                    ★ 4.91
                  </span>
                  <span>·</span>
                  <span className="underline cursor-pointer">140 ratings</span>
                  <span>·</span>
                  <span className="text-[#717171]">{listing.city} · Landmarks</span>
                </div>

                {/* Share / Save */}
                <div className="flex items-center gap-4 pt-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied!");
                    }}
                    className="p-2 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                  >
                    <Share className="w-5 h-5 text-[#222222]" />
                  </button>
                  <button
                    onClick={handleToggleWishlist}
                    className="p-2 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted ? "fill-[#FF385C] text-[#FF385C]" : "text-[#222222]"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="h-[1px] bg-[#EBEBEB]" />

              {/* Host and Experience Meta Rows */}
              <div className="space-y-4 text-sm text-[#222222]">
                <div className="flex items-center gap-3.5">
                  <img
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
                    alt="Host"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-[#222222]">Hosted by Uvais</h4>
                    <p className="text-xs text-[#717171]">History guide and Storyteller</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 pt-1">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#222222]" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-[#222222]">---------</h5>
                    <p className="text-xs text-[#717171]">New Delhi, Delhi</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#222222]" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-[#222222]">Around 2 hr experience</h5>
                    <p className="text-xs text-[#717171]">Hosted in English</p>
                  </div>
                </div>
              </div>

              {/* Sticky Reservation Card with Date Slots (rec5.mp4.mp4 frame_14.0s) */}
              <div className="sticky top-28 bg-white border border-[#EBEBEB] rounded-3xl p-6 shadow-[0_6px_20px_rgba(0,0,0,0.12)] space-y-5">
                
                {/* Header: Price & Show dates button */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-[#717171]">From</span>
                      <span className="text-xl font-bold text-[#222222] underline decoration-1">
                        ₹{listing.price_per_night.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-[#717171]">/ guest</span>
                    </div>
                    <p className="text-[11px] font-semibold text-[#E00B41] mt-0.5">
                      Free cancellation
                    </p>
                  </div>

                  <button
                    onClick={handleReserve}
                    disabled={bookingLoading}
                    className="bg-[#E00B41] hover:bg-[#D70466] text-white text-sm font-bold py-2.5 px-6 rounded-full shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    {bookingLoading ? "Reserving..." : "Show dates"}
                  </button>
                </div>

                {/* Date Slots List (rec5.mp4.mp4 frame_14.0s) */}
                <div className="space-y-2.5">
                  {experienceDateSlots.map((slot, index) => {
                    const isSelected = selectedSlotIndex === index;
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedSlotIndex(index)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer ${
                          isSelected
                            ? "border-black bg-neutral-50 ring-1 ring-black"
                            : "border-[#DDDDDD] hover:border-black"
                        }`}
                      >
                        <h5 className="text-sm font-bold text-[#222222]">{slot.label}</h5>
                        <p className="text-xs text-[#717171] mt-0.5">{slot.time}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Error Message */}
                {bookingError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
                    {bookingError}
                  </div>
                )}

                {/* Primary CTA */}
                <button
                  onClick={handleReserve}
                  disabled={bookingLoading}
                  className="w-full bg-[#E00B41] hover:bg-[#D70466] text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {bookingLoading ? "Booking experience..." : "Reserve this slot"}
                </button>

              </div>

            </div>

          </div>
        </main>
      ) : (
        /* ========================================================================= */
        /* CASE B: HOME STAY DETAIL LAYOUT (rec4.mp4.mp4 frame_28.0s to 66.0s)       */
        /* ========================================================================= */
        <>
          {/* Sticky Sub-Header Bar */}
          {scrolledPastHero && (
            <div className="sticky top-0 z-40 bg-white border-b border-[#EBEBEB] shadow-xs transition-all duration-200">
              <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-20 flex items-center justify-between h-20">
                <div className="flex items-center gap-8 h-full">
                  {[
                    { id: "photos", label: "Photos" },
                    { id: "amenities", label: "Amenities" },
                    { id: "reviews", label: "Reviews" },
                    { id: "location", label: "Location" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        const el = document.getElementById(item.id);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className={`h-full text-sm font-semibold transition border-b-2 cursor-pointer ${
                        activeTab === item.id
                          ? "border-black text-black"
                          : "border-transparent text-[#717171] hover:text-black"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-[#222222]">
                      ₹{calculateTotals ? calculateTotals.total.toLocaleString("en-IN") : listing.price_per_night.toLocaleString("en-IN")}{" "}
                      <span className="font-normal text-xs text-[#717171]">
                        for {calculateTotals ? calculateTotals.nights : 2} nights
                      </span>
                    </div>
                    <div className="text-xs text-[#222222] flex items-center justify-end gap-1">
                      <span>★ {listing.average_rating ? listing.average_rating.toFixed(1) : "5.0"}</span>
                      <span className="text-[#717171]">· {listing.review_count || 13} reviews</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const widget = document.getElementById("booking-card");
                      if (widget) {
                        widget.scrollIntoView({ behavior: "smooth", block: "center" });
                      } else {
                        handleReserve();
                      }
                    }}
                    className="bg-[#E00B41] hover:bg-[#D70466] text-white font-semibold text-sm px-7 py-3 rounded-xl shadow-md transition cursor-pointer"
                  >
                    Reserve
                  </button>
                </div>
              </div>
            </div>
          )}

          <main className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-20 py-6 w-full flex-1">
            
            {/* Title and Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h1 className="text-[26px] font-semibold text-[#222222] leading-tight">
                {listing.title}
              </h1>

              <div className="flex items-center gap-4 flex-shrink-0">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }}
                  className="flex items-center gap-2 text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7] px-3 py-2 rounded-lg transition underline cursor-pointer"
                >
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className="flex items-center gap-2 text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7] px-3 py-2 rounded-lg transition underline cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? "fill-[#FF385C] text-[#FF385C]" : "text-[#222222]"
                    }`}
                  />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Hero 5-Photo Mosaic Grid */}
            <div id="photos" className="grid grid-cols-4 grid-rows-2 gap-2 h-[340px] sm:h-[420px] rounded-2xl overflow-hidden relative mb-8">
              <div
                onClick={() => setIsGalleryOpen(true)}
                className="col-span-2 row-span-2 overflow-hidden cursor-pointer bg-neutral-100"
              >
                <img
                  src={images[0]}
                  alt="Listing main"
                  className="w-full h-full object-cover hover:scale-102 hover:brightness-95 transition duration-300"
                />
              </div>

              <div
                onClick={() => setIsGalleryOpen(true)}
                className="col-span-1 row-span-1 overflow-hidden cursor-pointer bg-neutral-100"
              >
                <img
                  src={images[1] || images[0]}
                  alt="Photo 2"
                  className="w-full h-full object-cover hover:scale-102 hover:brightness-95 transition duration-300"
                />
              </div>

              <div
                onClick={() => setIsGalleryOpen(true)}
                className="col-span-1 row-span-1 overflow-hidden cursor-pointer bg-neutral-100"
              >
                <img
                  src={images[2] || images[0]}
                  alt="Photo 3"
                  className="w-full h-full object-cover hover:scale-102 hover:brightness-95 transition duration-300"
                />
              </div>

              <div
                onClick={() => setIsGalleryOpen(true)}
                className="col-span-1 row-span-1 overflow-hidden cursor-pointer bg-neutral-100"
              >
                <img
                  src={images[3] || images[0]}
                  alt="Photo 4"
                  className="w-full h-full object-cover hover:scale-102 hover:brightness-95 transition duration-300"
                />
              </div>

              <div
                onClick={() => setIsGalleryOpen(true)}
                className="col-span-1 row-span-1 overflow-hidden cursor-pointer relative bg-neutral-100"
              >
                <img
                  src={images[4] || images[0]}
                  alt="Photo 5"
                  className="w-full h-full object-cover hover:scale-102 hover:brightness-95 transition duration-300"
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGalleryOpen(true);
                  }}
                  className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-[#222222] font-semibold text-xs sm:text-sm py-1.5 px-3.5 rounded-lg border border-black shadow-md flex items-center gap-2 cursor-pointer transition"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Show all photos</span>
                </button>
              </div>
            </div>

            {/* 2-Column Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              {/* Left Column */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                
                <div>
                  <h2 className="text-[22px] font-semibold text-[#222222]">
                    Entire rental unit in {listing.city}, India
                  </h2>
                  <p className="text-[15px] text-[#222222] mt-1">
                    {listing.max_guests} guests · {listing.bedrooms} bedroom · {listing.beds} bed · {listing.bathrooms} bathroom
                  </p>
                  <div className="mt-2.5">
                    <span className="inline-block bg-[#F7F7F7] text-[#222222] text-xs font-semibold px-2.5 py-1 rounded-md">
                      Free cancellation
                    </span>
                  </div>
                </div>

                {/* Guest Favourite Box */}
                <div className="border border-[#DDDDDD] rounded-2xl p-6 flex items-center justify-between bg-white shadow-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl select-none">🌿</span>
                    <div>
                      <h3 className="font-bold text-base text-[#222222]">Guest favourite</h3>
                      <p className="text-xs text-[#717171] mt-0.5 leading-snug max-w-xs">
                        One of the most loved homes on Airbnb, according to guests
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 divide-x divide-[#EBEBEB]">
                    <div className="text-center pr-2">
                      <div className="text-lg font-bold text-[#222222]">5.0</div>
                      <div className="text-xs text-black">★★★★★</div>
                    </div>
                    <div className="text-center pl-6">
                      <div className="text-lg font-bold text-[#222222]">{listing.review_count || 13}</div>
                      <div className="text-xs text-[#222222] underline cursor-pointer">Reviews</div>
                    </div>
                  </div>
                </div>

                {/* Host overview row */}
                <div className="flex items-center gap-4 py-2 border-b border-[#EBEBEB]">
                  <div className="relative">
                    <img
                      src={listing.host?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                      alt={listing.host?.full_name || "Host"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-[#E00B41] text-white p-0.5 rounded-full text-[10px]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-[#222222]">
                      Hosted by {listing.host?.full_name || "Deeksha"}
                    </h4>
                    <p className="text-sm text-[#717171]">
                      Superhost · 1 year hosting
                    </p>
                  </div>
                </div>

                {/* Highlights List */}
                <div className="space-y-6 py-2 border-b border-[#EBEBEB]">
                  <div className="flex items-start gap-4">
                    <Waves className="w-6 h-6 text-[#222222] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-base font-semibold text-[#222222]">Dive right in</h4>
                      <p className="text-sm text-[#717171]">This is one of the few places in the area with a pool.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Key className="w-6 h-6 text-[#222222] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-base font-semibold text-[#222222]">Exceptional check-in experience</h4>
                      <p className="text-sm text-[#717171]">Recent guests gave the check-in process a 5-star rating.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-[#222222] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-base font-semibold text-[#222222]">Unbeatable location</h4>
                      <p className="text-sm text-[#717171]">100% of guests in the past year gave this location a 5-star rating.</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4 py-2 border-b border-[#EBEBEB]">
                  <p className={`text-base text-[#222222] leading-relaxed ${!showFullDescription ? "line-clamp-4" : ""}`}>
                    {listing.description}
                  </p>

                  <div>
                    <h4 className="text-base font-semibold text-[#222222] mt-4 mb-1">Guest access</h4>
                    <p className="text-sm text-[#717171] leading-relaxed">
                      Guests will have access to the entire apartment, ensuring complete privacy and comfort during their stay.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="font-semibold text-base text-[#222222] underline flex items-center gap-1 cursor-pointer pt-2"
                  >
                    <span>{showFullDescription ? "Show less" : "Show more"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Where you'll sleep */}
                <div className="py-2 border-b border-[#EBEBEB]">
                  <h3 className="text-[22px] font-semibold text-[#222222] mb-5">Where you&apos;ll sleep</h3>
                  <div className="border border-[#DDDDDD] rounded-2xl p-6 w-60 space-y-3">
                    <Layers className="w-6 h-6 text-[#222222]" />
                    <div>
                      <h4 className="text-base font-semibold text-[#222222]">Bedroom 1</h4>
                      <p className="text-sm text-[#717171] mt-0.5">1 double bed</p>
                    </div>
                  </div>
                </div>

                {/* Amenities Section */}
                <div id="amenities" className="py-2 border-b border-[#EBEBEB]">
                  <h3 className="text-[22px] font-semibold text-[#222222] mb-6">What this place offers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-base text-[#222222]">
                    {(listing.amenities && listing.amenities.length > 0
                      ? listing.amenities
                      : [
                          "Air conditioning",
                          "Private patio or balcony",
                          "Hairdryer",
                          "Microwave",
                          "Kitchen",
                          "Wifi",
                          "Free parking on premises",
                          "Hot water",
                        ]
                    )
                      .slice(0, showAllAmenities ? undefined : 8)
                      .map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </div>
                      ))}
                  </div>

                  {(listing.amenities?.length || 8) > 8 && (
                    <button
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      className="mt-8 border border-black hover:bg-[#F7F7F7] text-[#222222] font-semibold text-base px-6 py-3.5 rounded-xl transition cursor-pointer"
                    >
                      {showAllAmenities ? "Show fewer amenities" : `Show all ${listing.amenities?.length} amenities`}
                    </button>
                  )}
                </div>

                {/* Calendar */}
                <div className="py-2">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[22px] font-semibold text-[#222222]">
                      {calculateTotals ? `${calculateTotals.nights} nights in ${listing.city}` : `Select dates in ${listing.city}`}
                    </h3>
                    {(checkIn || checkOut) && (
                      <button
                        onClick={() => {
                          setCheckIn("");
                          setCheckOut("");
                        }}
                        className="text-xs font-semibold underline text-[#222222] hover:text-[#717171] cursor-pointer"
                      >
                        Clear dates
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-[#717171] mb-6">
                    {checkIn && checkOut
                      ? `${new Date(checkIn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} – ${new Date(checkOut).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                      : checkIn
                      ? `Check-in: ${new Date(checkIn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} (Select checkout date)`
                      : "Minimum stay: 1 night"}
                  </p>

                  <div className="border border-[#EBEBEB] rounded-2xl p-6 bg-white shadow-xs">
                    {/* Month navigation header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => {
                          setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
                        }}
                        className="p-2 rounded-full border border-gray-200 hover:border-black transition text-[#222222] cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-[#717171] font-medium">Click a date to select check-in and checkout</span>
                      <button
                        onClick={() => {
                          setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
                        }}
                        className="p-2 rounded-full border border-gray-200 hover:border-black transition text-[#222222] cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Month 1 & Month 2 */}
                      {[0, 1].map((offset) => {
                        const mDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1);
                        const { firstDay, days } = getMonthDays(mDate.getFullYear(), mDate.getMonth());
                        const monthName = mDate.toLocaleString("en-US", { month: "long", year: "numeric" });

                        return (
                          <div key={offset}>
                            <div className="text-center font-bold text-sm text-[#222222] mb-4">
                              {monthName}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#717171] mb-2">
                              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                              {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty_${offset}_${i}`} className="p-2" />
                              ))}
                              {days.map((item) => {
                                const isBooked = isDateBooked(item.dateStr);
                                const isStart = checkIn === item.dateStr;
                                const isEnd = checkOut === item.dateStr;
                                const inRange = checkIn && checkOut && item.dateStr > checkIn && item.dateStr < checkOut;

                                if (isBooked) {
                                  return (
                                    <div
                                      key={item.dateStr}
                                      title="Booked"
                                      className="p-2 text-gray-300 line-through select-none"
                                    >
                                      {item.day}
                                    </div>
                                  );
                                }

                                if (isStart || isEnd) {
                                  return (
                                    <button
                                      key={item.dateStr}
                                      onClick={() => handleDateClick(item.dateStr)}
                                      className="p-2 bg-black text-white font-bold rounded-full cursor-pointer shadow-xs"
                                    >
                                      {item.day}
                                    </button>
                                  );
                                }

                                if (inRange) {
                                  return (
                                    <button
                                      key={item.dateStr}
                                      onClick={() => handleDateClick(item.dateStr)}
                                      className="p-2 bg-neutral-100 text-black font-semibold rounded-none cursor-pointer hover:bg-neutral-200"
                                    >
                                      {item.day}
                                    </button>
                                  );
                                }

                                return (
                                  <button
                                    key={item.dateStr}
                                    onClick={() => handleDateClick(item.dateStr)}
                                    className="p-2 hover:bg-neutral-100 rounded-full cursor-pointer transition text-[#222222]"
                                  >
                                    {item.day}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Sticky Reservation Box */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="sticky top-28 space-y-4">
                  
                  {/* Promo Banner */}
                  <div className="bg-white border border-[#EBEBEB] rounded-2xl p-4 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🏷️</span>
                      <div>
                        <p className="text-xs font-semibold text-[#222222]">Take 10% off your next stay.</p>
                        <p className="text-[11px] text-[#717171] underline cursor-pointer">Terms apply</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert("10% promotional discount applied at checkout!")}
                      className="bg-[#F7F7F7] hover:bg-neutral-200 text-[#222222] font-semibold text-xs px-4 py-2 rounded-xl border border-gray-200 transition cursor-pointer"
                    >
                      Claim
                    </button>
                  </div>

                  {/* Reservation Card */}
                  <div id="booking-card" className="bg-white border border-[#DDDDDD] rounded-3xl p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)] space-y-4">
                    
                    <div>
                      <div className="text-[22px] font-bold text-[#222222] underline decoration-1">
                        ₹{calculateTotals ? calculateTotals.total.toLocaleString("en-IN") : "10,446"}{" "}
                        <span className="text-base font-normal no-underline text-[#717171]">
                          for {calculateTotals ? calculateTotals.nights : 2} nights
                        </span>
                      </div>
                    </div>

                    <div className="border border-[#B0B0B0] rounded-xl overflow-hidden text-xs">
                      <div className="grid grid-cols-2 divide-x divide-[#B0B0B0] border-b border-[#B0B0B0]">
                        <div className="p-2.5">
                          <label className="block text-[10px] font-extrabold text-[#222222] tracking-wider uppercase">
                            Check-in
                          </label>
                          <input
                            type="date"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="w-full text-xs font-medium text-[#222222] focus:outline-none bg-transparent cursor-pointer"
                          />
                        </div>
                        <div className="p-2.5">
                          <label className="block text-[10px] font-extrabold text-[#222222] tracking-wider uppercase">
                            Checkout
                          </label>
                          <input
                            type="date"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="w-full text-xs font-medium text-[#222222] focus:outline-none bg-transparent cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 relative">
                        <label className="block text-[10px] font-extrabold text-[#222222] tracking-wider uppercase">
                          Guests
                        </label>
                        <button
                          type="button"
                          onClick={() => setGuestMenuOpen(!guestMenuOpen)}
                          className="w-full flex items-center justify-between text-xs font-medium text-[#222222] cursor-pointer pt-0.5"
                        >
                          <span>{guestCount} {guestCount === 1 ? "guest" : "guests"}</span>
                          <ChevronDown className="w-4 h-4 text-[#717171]" />
                        </button>

                        {guestMenuOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#DDDDDD] rounded-xl shadow-lg p-3 z-30 space-y-2">
                            {[1, 2, 3, 4].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => {
                                  setGuestCount(n);
                                  setGuestMenuOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                  guestCount === n ? "bg-neutral-100" : "hover:bg-neutral-50"
                                }`}
                              >
                                {n} {n === 1 ? "guest" : "guests"}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#F7F7F7] text-[#222222] text-xs font-medium py-2 px-3 rounded-lg text-center">
                      Free cancellation before 8 October
                    </div>

                    {bookingError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
                        {bookingError}
                      </div>
                    )}

                    <button
                      onClick={handleReserve}
                      disabled={bookingLoading}
                      className="w-full bg-[#E00B41] hover:bg-[#D70466] text-white font-semibold py-3.5 rounded-xl text-base shadow-md transition cursor-pointer disabled:opacity-50"
                    >
                      {bookingLoading ? "Reserving..." : "Reserve"}
                    </button>

                    <p className="text-xs text-[#717171] text-center">
                      You won&apos;t be charged yet
                    </p>

                    {calculateTotals && (
                      <div className="space-y-3 pt-3 border-t border-[#EBEBEB] text-sm text-[#222222]">
                        <div className="flex justify-between">
                          <span className="underline">₹{listing.price_per_night.toLocaleString("en-IN")} × {calculateTotals.nights} nights</span>
                          <span>₹{calculateTotals.basePrice.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="underline">Cleaning fee</span>
                          <span>₹{calculateTotals.cleaningFee.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="underline">Airbnb service fee</span>
                          <span>₹{calculateTotals.serviceFee.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="h-[1px] bg-[#EBEBEB] my-2" />
                        <div className="flex justify-between text-base font-bold text-black">
                          <span>Total before taxes</span>
                          <span>₹{calculateTotals.total.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 text-center">
                      <button
                        onClick={() => alert("Thank you. Our Trust & Safety team will review this listing.")}
                        className="text-xs text-[#717171] hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>Report this listing</span>
                      </button>
                    </div>

                  </div>

                </div>
              </div>

            </div>

            {/* 3. Reviews Section */}
            <section id="reviews" className="pt-12 mt-12 border-t border-[#EBEBEB]">
              <div className="flex items-center gap-2 mb-8">
                <span className="text-2xl font-bold text-[#222222]">★</span>
                <h2 className="text-[22px] font-semibold text-[#222222]">
                  {listing.average_rating ? listing.average_rating.toFixed(1) : "5.0"} · {listing.review_count || 13} reviews
                </h2>
              </div>

              {/* 6 Category Rating Cards + Histogram */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 pb-8 border-b border-[#EBEBEB]">
                <div className="space-y-1 pr-4 border-r border-[#EBEBEB]">
                  <p className="text-xs font-bold text-[#222222]">Overall rating</p>
                  <div className="space-y-1 pt-1">
                    {[
                      { star: 5, width: "100%" },
                      { star: 4, width: "0%" },
                      { star: 3, width: "0%" },
                      { star: 2, width: "0%" },
                      { star: 1, width: "0%" },
                    ].map((row) => (
                      <div key={row.star} className="flex items-center gap-1.5 text-[10px] text-[#717171]">
                        <span className="w-2">{row.star}</span>
                        <div className="flex-1 h-1 bg-[#EBEBEB] rounded-full overflow-hidden">
                          <div className="h-full bg-black rounded-full" style={{ width: row.width }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pr-4 border-r border-[#EBEBEB]">
                  <div>
                    <p className="text-xs font-semibold text-[#222222]">Cleanliness</p>
                    <p className="text-sm font-bold text-[#222222]">5.0</p>
                  </div>
                  <Sparkles className="w-6 h-6 text-[#222222]" />
                </div>

                <div className="space-y-2 pr-4 border-r border-[#EBEBEB]">
                  <div>
                    <p className="text-xs font-semibold text-[#222222]">Accuracy</p>
                    <p className="text-sm font-bold text-[#222222]">5.0</p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-[#222222]" />
                </div>

                <div className="space-y-2 pr-4 border-r border-[#EBEBEB]">
                  <div>
                    <p className="text-xs font-semibold text-[#222222]">Check-in</p>
                    <p className="text-sm font-bold text-[#222222]">5.0</p>
                  </div>
                  <Key className="w-6 h-6 text-[#222222]" />
                </div>

                <div className="space-y-2 pr-4 border-r border-[#EBEBEB]">
                  <div>
                    <p className="text-xs font-semibold text-[#222222]">Communication</p>
                    <p className="text-sm font-bold text-[#222222]">5.0</p>
                  </div>
                  <MessageSquare className="w-6 h-6 text-[#222222]" />
                </div>

                <div className="space-y-2 pr-4 border-r border-[#EBEBEB]">
                  <div>
                    <p className="text-xs font-semibold text-[#222222]">Location</p>
                    <p className="text-sm font-bold text-[#222222]">5.0</p>
                  </div>
                  <MapPin className="w-6 h-6 text-[#222222]" />
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-[#222222]">Value</p>
                    <p className="text-sm font-bold text-[#222222]">5.0</p>
                  </div>
                  <Tag className="w-6 h-6 text-[#222222]" />
                </div>
              </div>

              {/* Mentions */}
              <div className="py-6">
                <h3 className="text-base font-semibold text-[#222222] mb-3">Guest reviews mention</h3>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { label: "Comfort", count: 3, icon: "🛋️" },
                    { label: "Accuracy", count: 2, icon: "✅" },
                    { label: "Location", count: 3, icon: "📍" },
                    { label: "Cleanliness", count: 2, icon: "🛍️" },
                    { label: "Hospitality", count: 2, icon: "🎁" },
                  ].map((m) => (
                    <button
                      key={m.label}
                      onClick={() => setSelectedMention(selectedMention === m.label ? null : m.label)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                        selectedMention === m.label
                          ? "border-black bg-neutral-100"
                          : "border-[#DDDDDD] bg-white hover:border-black"
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span className="text-[#222222]">{m.label}</span>
                      <span className="text-[#717171]">{m.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2-Column Reviews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 py-4">
                {(listing.reviews && listing.reviews.length > 0 ? listing.reviews : fallbackReviews).map((rev) => (
                  <div key={rev.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.author?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                        alt={rev.author?.full_name || "Guest"}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-base font-bold text-[#222222]">{rev.author?.full_name || rev.author?.email || "Guest"}</h4>
                        <p className="text-xs text-[#717171]">
                          {new Date(rev.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#222222]">
                      <span className="font-bold flex items-center gap-0.5 text-amber-500">
                        ★ {rev.rating_overall ? rev.rating_overall.toFixed(1) : "5.0"}
                      </span>
                    </div>

                    <p className="text-sm text-[#222222] leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <button
                  onClick={() => alert("Showing all 13 authentic reviews")}
                  className="border border-black hover:bg-[#F7F7F7] text-[#222222] font-semibold text-sm px-6 py-3 rounded-xl transition cursor-pointer"
                >
                  Show all 13 reviews
                </button>
              </div>

              <form onSubmit={handleAddReview} className="mt-8 border border-[#DDDDDD] p-6 rounded-2xl bg-[#FAFAFA] max-w-xl space-y-4">
                <h4 className="font-bold text-base text-[#222222]">Leave a Rating & Review</h4>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details of your stay..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full text-sm p-3.5 border border-gray-300 rounded-xl focus:outline-none focus:border-black bg-white"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-black text-white text-xs font-bold py-2.5 px-6 rounded-xl hover:bg-neutral-800 transition cursor-pointer"
                >
                  {submittingReview ? "Posting..." : "Post Review"}
                </button>
              </form>
            </section>

            {/* 4. Where you'll be */}
            <section id="location" className="pt-12 mt-12 border-t border-[#EBEBEB]">
              <h2 className="text-[22px] font-semibold text-[#222222] mb-1">
                Where you&apos;ll be
              </h2>
              <p className="text-base text-[#222222] mb-6">
                {listing.city}, Uttar Pradesh, India
              </p>

              <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-gray-200 bg-[#E5E3DF] shadow-xs">
                <iframe
                  title="Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=77.34%2C28.53%2C77.42%2C28.62&layer=mapnik&marker=${listing.latitude || 28.5744}%2C${listing.longitude || 77.3821}`}
                  className="w-full h-full filter saturate-90 brightness-98"
                />

                <div className="absolute top-5 left-5 bg-white rounded-full shadow-lg border border-[#DDDDDD] px-4 py-2.5 flex items-center gap-2.5 w-72 z-10">
                  <Search className="w-4 h-4 text-[#717171]" />
                  <input
                    type="text"
                    placeholder="Find things to do"
                    className="text-xs text-[#222222] placeholder:text-[#717171] focus:outline-none w-full bg-transparent"
                  />
                </div>
              </div>

              <p className="text-sm font-semibold text-[#222222] mt-4">
                Exact location will be provided after booking.
              </p>
            </section>

            {/* 5. Meet your host */}
            <section className="pt-12 mt-12 border-t border-[#EBEBEB]">
              <h2 className="text-[22px] font-semibold text-[#222222] mb-6">
                Meet your host
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-5 bg-white rounded-3xl border border-[#DDDDDD] p-7 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div className="relative inline-block mx-auto mb-2">
                        <img
                          src={listing.host?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80"}
                          alt={listing.host?.full_name || "Deeksha"}
                          className="w-24 h-24 rounded-full object-cover shadow-sm"
                        />
                        <span className="absolute bottom-1 right-1 bg-[#E00B41] text-white p-1 rounded-full">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-[#222222]">
                        {listing.host?.full_name || "Deeksha"}
                      </h3>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-[#717171] mt-0.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>Superhost</span>
                      </div>
                    </div>

                    <div className="space-y-4 text-right pr-4 border-l border-[#EBEBEB] pl-6">
                      <div>
                        <div className="text-xl font-bold text-[#222222]">187</div>
                        <div className="text-[10px] text-[#717171]">Reviews</div>
                      </div>
                      <div className="h-[1px] bg-[#EBEBEB]" />
                      <div>
                        <div className="text-xl font-bold text-[#222222]">4.88★</div>
                        <div className="text-[10px] text-[#717171]">Rating</div>
                      </div>
                      <div className="h-[1px] bg-[#EBEBEB]" />
                      <div>
                        <div className="text-xl font-bold text-[#222222]">1</div>
                        <div className="text-[10px] text-[#717171]">Year hosting</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-[#EBEBEB] text-sm text-[#222222]">
                    <div className="flex items-center gap-3">
                      <span className="text-base">🎈</span>
                      <span>Born in the 90s</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-[#717171]" />
                      <span>My work: HR Manager</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#222222]">
                      {listing.host?.full_name || "Deeksha"} is a Superhost
                    </h3>
                    <p className="text-sm text-[#717171] mt-1 leading-relaxed">
                      Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-[#222222]">Host details</h4>
                    <p className="text-sm text-[#222222]">Response rate: 100%</p>
                    <p className="text-sm text-[#222222]">Responds within an hour</p>
                  </div>

                  <div>
                    <button
                      onClick={() => alert(`Starting direct chat with ${listing.host?.full_name || "Deeksha"}...`)}
                      className="bg-[#F7F7F7] hover:bg-neutral-200 text-[#222222] font-semibold text-sm px-6 py-3 rounded-xl border border-gray-200 transition cursor-pointer"
                    >
                      Message host
                    </button>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-[#EBEBEB] text-xs text-[#717171]">
                    <Shield className="w-5 h-5 text-[#E00B41] flex-shrink-0" />
                    <span>
                      To help protect your payment, always use Airbnb to send money and communicate with hosts.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Things to know */}
            <section className="pt-12 mt-12 border-t border-[#EBEBEB]">
              <h2 className="text-[22px] font-semibold text-[#222222] mb-6">
                Things to know
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-[#222222]">
                <div className="space-y-2">
                  <h4 className="font-bold">Cancellation policy</h4>
                  <p className="text-[#717171] leading-relaxed">
                    Free cancellation before 8 October. Review the host&apos;s full cancellation policy for details.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold">House rules</h4>
                  <p className="text-[#717171]">Check-in after 2:00 pm</p>
                  <p className="text-[#717171]">Checkout before 11:00 am</p>
                  <p className="text-[#717171]">Self check-in with lockbox</p>
                  <p className="text-[#717171]">No smoking · No parties or events</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold">Safety & property</h4>
                  <p className="text-[#717171]">Exterior security cameras on property</p>
                  <p className="text-[#717171]">Carbon monoxide alarm installed</p>
                  <p className="text-[#717171]">Smoke alarm installed</p>
                </div>
              </div>
            </section>

          </main>
        </>
      )}

      {/* Full Photo Lightbox Gallery */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-6 sm:p-12 animate-in fade-in duration-200">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="sticky top-0 bg-white/90 backdrop-blur-xs py-4 flex items-center justify-between border-b border-gray-100 z-10">
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-[#222222] font-semibold flex items-center gap-1 text-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
                <span>Close gallery</span>
              </button>
              <span className="text-sm font-bold text-[#717171]">
                {images.length} photos · {listing.title}
              </span>
            </div>

            <div className="space-y-6">
              {images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="w-full rounded-2xl object-cover shadow-lg"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reservation Confirmation Modal */}
      {isSuccessModalOpen && confirmedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-[#222222]">Stay Confirmed!</h3>
              <p className="text-xs text-[#717171] mt-1">
                Your reservation at <span className="font-semibold text-black">{listing.title}</span> has been confirmed.
              </p>
            </div>

            <div className="bg-[#F7F7F7] rounded-2xl p-4 space-y-2 text-xs text-[#222222]">
              <div className="flex justify-between">
                <span className="text-[#717171]">Reservation ID</span>
                <span className="font-mono font-semibold">{confirmedBooking.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#717171]">Dates</span>
                <span className="font-semibold">{confirmedBooking.check_in} → {confirmedBooking.check_out} ({confirmedBooking.total_nights} nights)</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <span className="text-emerald-700">₹{confirmedBooking.total_price.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/trips")}
                className="flex-1 bg-black text-white py-3 rounded-xl text-xs font-bold hover:bg-neutral-800 transition cursor-pointer"
              >
                View My Trips
              </button>
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="px-5 py-3 border border-gray-300 rounded-xl text-xs font-semibold hover:border-black transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onUserLoggedIn={(u) => {
          setCurrentUser(u);
          loadData();
        }}
      />

      {/* Currency Modal */}
      <CurrencyModal
        isOpen={isCurrencyOpen}
        onClose={() => setIsCurrencyOpen(false)}
        selectedCurrency="INR"
        onSelectCurrency={() => {}}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
