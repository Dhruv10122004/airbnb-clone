"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import AuthModal from "@/components/AuthModal";
import { ListingSummary, User } from "@/types";
import { fetchWishlistListings, toggleWishlist, fetchCurrentUser } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export default function WishlistsPage() {
  const [wishlists, setWishlists] = useState<ListingSummary[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [saved, user] = await Promise.all([
        fetchWishlistListings(),
        fetchCurrentUser().catch(() => null),
      ]);
      setWishlists(saved);
      setCurrentUser(user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (listingId: string) => {
    try {
      await toggleWishlist(listingId);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar
        onOpenAuthModal={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        onLogout={() => {
          localStorage.removeItem("airbnb_user_id");
          setCurrentUser(null);
          loadData();
        }}
      />

      <main className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-16 py-10 flex-1 w-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#EBEBEB] mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#222222]">Wishlists</h1>
            <p className="text-sm text-[#717171] mt-1">
              Your saved stays and favorite properties
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#222222] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore stays</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[20/19] bg-neutral-100 rounded-2xl" />
            ))}
          </div>
        ) : wishlists.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-3xl">
            <h3 className="text-lg font-bold text-[#222222]">No saves yet</h3>
            <p className="text-xs text-[#717171] mt-2 max-w-sm mx-auto">
              As you search, tap the heart icon on any stay to save your favorite places to stay here.
            </p>
            <Link
              href="/"
              className="inline-block mt-5 px-6 py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition"
            >
              Start exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {wishlists.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                isWishlisted={true}
                onToggleWishlist={handleToggle}
              />
            ))}
          </div>
        )}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onUserLoggedIn={(u) => {
          setCurrentUser(u);
          loadData();
        }}
      />

      <Footer />
    </div>
  );
}
