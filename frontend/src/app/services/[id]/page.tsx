"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ServiceDetailView from "@/components/ServiceDetailView";
import AuthModal from "@/components/AuthModal";
import CurrencyModal from "@/components/CurrencyModal";
import { ListingDetail, User } from "@/types";
import {
  fetchListingById,
  fetchCurrentUser,
  toggleWishlist,
} from "@/lib/api";

export default function ServicePage() {
  const params = useParams();
  const id = params?.id as string;

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [detail, user] = await Promise.all([
        fetchListingById(id),
        fetchCurrentUser().catch(() => null),
      ]);
      setListing(detail);
      setCurrentUser(user);
    } catch (err) {
      console.error("Error loading service detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const handleToggleWishlist = async () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    try {
      await toggleWishlist(id);
      setIsWishlisted(!isWishlisted);
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#FF385C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <h2 className="text-xl font-bold text-[#222222]">Service not found</h2>
        <a href="/" className="mt-4 text-[#FF385C] font-semibold underline">
          Back to Explore
        </a>
      </div>
    );
  }

  return (
    <>
      <ServiceDetailView
        listing={listing}
        currentUser={currentUser}
        isWishlisted={isWishlisted}
        onToggleWishlist={handleToggleWishlist}
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
