"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Menu, User as UserIcon, HelpCircle, Compass, Home, Sparkles, Building } from "lucide-react";
import { User } from "@/types";
import { fetchCurrentUser } from "@/lib/api";

interface NavbarProps {
  onOpenAuthModal: () => void;
  currentUser: User | null;
  onLogout: () => void;
  centerContent?: React.ReactNode;
}

export default function Navbar({
  onOpenAuthModal,
  currentUser,
  onLogout,
  centerContent,
}: NavbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"homes" | "experiences" | "services" | "all">("homes");
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#EBEBEB] transition-all">
      <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between h-20">
        
        {/* Left: Airbnb Brand Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
          <svg
            className="w-8 h-8 text-[#FF385C]"
            viewBox="0 0 32 32"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.18 12.87 6.18 17.155 0 5.253-3.957 8.551-8.964 8.551-3.626 0-6.195-1.745-7.5-4.14-1.305 2.395-3.874 4.14-7.5 4.14C3.993 31 0 27.702 0 22.449c0-4.285 4.226-13.325 6.18-17.155l.533-1.025C8.001 1.963 9.456 1 11.464 1H16zm0 2.5h-4.536c-1.129 0-2.094.61-3.153 2.502l-.504.97C5.975 10.638 2.5 18.736 2.5 22.449c0 3.864 2.809 6.051 6.5 6.051 3.12 0 5.438-1.782 6.18-4.568.16-.604.8-1.01 1.427-.927.575.076.993.567.993 1.147v.149c.28 2.535 2.457 4.199 5.364 4.199 3.691 0 6.5-2.187 6.5-6.051 0-3.713-3.475-11.811-5.293-15.472l-.504-.97C22.63 4.11 21.665 3.5 20.536 3.5H16zm0 8.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-[#FF385C] hidden md:inline">
            airbnb
          </span>
        </Link>

        {/* Center: Homes / Experiences / Services tabs or Custom Search */}
        {centerContent ? (
          <div className="flex-1 max-w-2xl px-4">{centerContent}</div>
        ) : (
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 py-2 px-3 text-sm font-medium transition-colors ${
                activeTab === "all" ? "text-black border-b-2 border-black" : "text-[#717171] hover:text-black"
              }`}
            >
              <Compass className="w-5 h-5 text-amber-700" />
              <span>All</span>
            </button>
            <button
              onClick={() => setActiveTab("homes")}
              className={`flex items-center gap-2 py-2 px-3 text-sm font-semibold transition-colors ${
                activeTab === "homes" ? "text-black border-b-2 border-black" : "text-[#717171] hover:text-black"
              }`}
            >
              <Home className="w-5 h-5 text-emerald-700" />
              <span>Homes</span>
            </button>
            <button
              onClick={() => setActiveTab("experiences")}
              className={`flex items-center gap-2 py-2 px-3 text-sm font-medium transition-colors ${
                activeTab === "experiences" ? "text-black border-b-2 border-black" : "text-[#717171] hover:text-black"
              }`}
            >
              <Sparkles className="w-5 h-5 text-rose-500" />
              <span>Experiences</span>
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-2 py-2 px-3 text-sm font-medium transition-colors ${
                activeTab === "services" ? "text-black border-b-2 border-black" : "text-[#717171] hover:text-black"
              }`}
            >
              <Building className="w-5 h-5 text-slate-700" />
              <span>Services</span>
            </button>
          </div>
        )}

        {/* Right: Airbnb your home + Globe + Profile Menu */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/host"
            className="text-sm font-semibold text-[#222222] py-2.5 px-3.5 rounded-full hover:bg-[#F7F7F7] transition"
          >
            {currentUser?.role === "host" ? "Host Dashboard" : "Airbnb your home"}
          </Link>

          <button
            aria-label="Language & Currency"
            className="p-2.5 rounded-full hover:bg-[#F7F7F7] text-[#222222] transition"
          >
            <Globe className="w-4 h-4" />
          </button>

          {/* User Profile Pill */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 py-1.5 px-3 border border-[#DDDDDD] rounded-full hover:shadow-md transition cursor-pointer"
            >
              <Menu className="w-4 h-4 text-[#222222]" />
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#717171] text-white flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </button>

            {/* Dropdown Menu (Exact Replica of Airbnb) */}
            {menuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] border border-[#EBEBEB] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                {currentUser ? (
                  // Logged In Menu
                  <>
                    <div className="px-4 py-2 border-b border-[#EBEBEB]">
                      <p className="text-sm font-semibold text-[#222222] truncate">{currentUser.full_name}</p>
                      <p className="text-xs text-[#717171] truncate">{currentUser.email}</p>
                      {currentUser.is_superhost && (
                        <span className="inline-block mt-1 text-[11px] font-bold text-[#FF385C] bg-rose-50 px-2 py-0.5 rounded-full">
                          ★ Superhost
                        </span>
                      )}
                    </div>
                    <Link
                      href="/trips"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] font-medium"
                    >
                      Trips
                    </Link>
                    <Link
                      href="/wishlists"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] font-medium"
                    >
                      Wishlists
                    </Link>
                    <div className="h-[1px] bg-[#EBEBEB] my-1" />
                    <Link
                      href="/host"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      {currentUser.role === "host" ? "Manage listings" : "Switch to hosting"}
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      Switch demo profile
                    </button>
                    <div className="h-[1px] bg-[#EBEBEB] my-1" />
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#717171] hover:bg-[#F7F7F7]"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  // Logged Out Menu (Exact replica of user's screenshot)
                  <>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] flex items-center gap-2"
                    >
                      <HelpCircle className="w-4 h-4 text-[#717171]" />
                      <span>Help Centre</span>
                    </button>

                    <div className="h-[1px] bg-[#EBEBEB] my-1" />

                    {/* Become a Host Card */}
                    <Link
                      href="/host"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 hover:bg-[#F7F7F7] transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#222222]">Become a host</p>
                          <p className="text-xs text-[#717171] mt-0.5 leading-snug">
                            It&apos;s easy to start hosting and earn extra income.
                          </p>
                        </div>
                        <span className="text-2xl ml-2">🏠</span>
                      </div>
                    </Link>

                    <div className="h-[1px] bg-[#EBEBEB] my-1" />

                    <button
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      Refer a host
                    </button>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      Find a co-host
                    </button>

                    <div className="h-[1px] bg-[#EBEBEB] my-1" />

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      Log in or sign up
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
