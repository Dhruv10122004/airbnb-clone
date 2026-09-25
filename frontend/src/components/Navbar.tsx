"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Globe, Menu, HelpCircle, User as UserIcon } from "lucide-react";
import { User } from "@/types";
import AirbnbLogo from "./AirbnbLogo";

interface NavbarProps {
  onOpenAuthModal: () => void;
  onOpenCurrencyModal?: () => void;
  currentUser: User | null;
  onLogout: () => void;
  activeNavTab?: "all" | "homes" | "experiences" | "services";
  onSelectNavTab?: (tab: "all" | "homes" | "experiences" | "services") => void;
}

export default function Navbar({
  onOpenAuthModal,
  onOpenCurrencyModal,
  currentUser,
  onLogout,
  activeNavTab = "homes",
  onSelectNavTab,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Scroll state: true when user has scrolled past ~80px
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position to toggle compact navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleTabClick = (tab: "all" | "homes" | "experiences" | "services") => {
    if (onSelectNavTab) {
      onSelectNavTab(tab);
    }
    if (pathname === "/") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.pushState({}, "", url.toString());
    } else {
      router.push(`/?tab=${tab}`);
    }
  };

  return (
    <header className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${scrolled ? "border-b border-[#EBEBEB] shadow-sm" : "border-b border-[#EBEBEB]"}`}>
      <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between h-20">
        
        {/* Left: Airbnb Brand Logo */}
        <Link href="/" className="flex items-center flex-shrink-0 cursor-pointer">
          <AirbnbLogo className="h-7 w-auto text-[#FF385C] md:hidden" showText={false} />
          <AirbnbLogo className="h-[30px] w-auto text-[#FF385C] hidden md:block" showText={true} />
        </Link>

        {/* Center: Tab row (top of page) OR compact pill (scrolled) */}
        {!scrolled ? (
          /* Full tab row — with exact authentic icons from original site */
          <div className="hidden md:flex items-center gap-7 h-full">
            {/* All */}
            <button
              onClick={() => handleTabClick("all")}
              className={`flex items-center gap-2.5 h-full px-1 text-[14px] transition-colors cursor-pointer border-b-[2.5px] ${
                activeNavTab === "all"
                  ? "border-black font-semibold text-black"
                  : "border-transparent text-[#717171] hover:text-black font-medium"
              }`}
            >
              <img
                src="/icons/nav_all.png"
                alt="All"
                className="w-6 h-6 object-contain flex-shrink-0"
              />
              <span>All</span>
            </button>

            {/* Homes */}
            <button
              onClick={() => handleTabClick("homes")}
              className={`flex items-center gap-2.5 h-full px-1 text-[14px] transition-colors cursor-pointer border-b-[2.5px] ${
                activeNavTab === "homes"
                  ? "border-black font-semibold text-black"
                  : "border-transparent text-[#717171] hover:text-black font-medium"
              }`}
            >
              <img
                src="/icons/nav_homes.png"
                alt="Homes"
                className="w-[28px] h-[22px] object-contain flex-shrink-0"
              />
              <span>Homes</span>
            </button>

            {/* Experiences */}
            <button
              onClick={() => handleTabClick("experiences")}
              className={`flex items-center gap-2.5 h-full px-1 text-[14px] transition-colors cursor-pointer border-b-[2.5px] ${
                activeNavTab === "experiences"
                  ? "border-black font-semibold text-black"
                  : "border-transparent text-[#717171] hover:text-black font-medium"
              }`}
            >
              <img
                src="/icons/nav_experiences.png"
                alt="Experiences"
                className="w-[18px] h-[24px] object-contain flex-shrink-0"
              />
              <span>Experiences</span>
            </button>

            {/* Services */}
            <button
              onClick={() => handleTabClick("services")}
              className={`flex items-center gap-2.5 h-full px-1 text-[14px] transition-colors cursor-pointer border-b-[2.5px] ${
                activeNavTab === "services"
                  ? "border-black font-semibold text-black"
                  : "border-transparent text-[#717171] hover:text-black font-medium"
              }`}
            >
              <img
                src="/icons/nav_services.png"
                alt="Services"
                className="w-[26px] h-[22px] object-contain flex-shrink-0"
              />
              <span>Services</span>
            </button>
          </div>
        ) : (
          /* Compact search pill — shown when scrolled */
          <div className="hidden md:flex flex-1 justify-center px-6">
            <button className="flex items-center gap-0 border border-[#DDDDDD] rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.08),0_3px_12px_rgba(0,0,0,0.08)] hover:shadow-md transition-shadow duration-200 bg-white text-sm font-medium text-[#222222]">
              <span className="flex items-center gap-2 px-4 py-2.5 border-r border-[#EBEBEB]">
                <img
                  src="/icons/nav_homes.png"
                  alt="Homes"
                  className="w-5 h-4 object-contain"
                />
                <span className="text-[13px] font-semibold text-[#222222]">Anywhere</span>
              </span>
              <span className="px-4 py-2.5 border-r border-[#EBEBEB] text-[13px] font-semibold text-[#222222]">Anytime</span>
              <span className="flex items-center gap-3 pl-4 pr-2 py-1.5">
                <span className="text-[#717171] text-[13px] font-normal">Add guests</span>
                <span className="bg-[#FF385C] text-white rounded-full p-2 flex items-center justify-center">
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 fill-white">
                    <path d="M13 0C5.82 0 0 5.82 0 13s5.82 13 13 13 13-5.82 13-13S20.18 0 13 0zm0 2c6.08 0 11 4.92 11 11s-4.92 11-11 11S2 19.08 2 13 6.92 2 13 2zm8.49 19.51l6.01 6.01-1.42 1.42-6.01-6.01L21.49 21.51z"/>
                  </svg>
                </span>
              </span>
            </button>
          </div>
        )}

        {/* Right: Log in or sign up + Globe Button + Pill Hamburger */}
        <div className="flex items-center gap-2">
          {/* Log in or sign up button (when logged out, matches real Airbnb) */}
          {!currentUser ? (
            <button
              onClick={onOpenAuthModal}
              className="text-[14px] font-semibold text-[#222222] hover:bg-[#F7F7F7] px-3.5 py-2 rounded-full transition cursor-pointer whitespace-nowrap"
            >
              Log in or sign up
            </button>
          ) : (
            <Link
              href="/host"
              className="text-[14px] font-semibold text-[#222222] hover:bg-[#F7F7F7] px-3.5 py-2 rounded-full transition cursor-pointer whitespace-nowrap hidden sm:block"
            >
              {currentUser.role === "host" ? "Manage listings" : "Switch to hosting"}
            </Link>
          )}

          {/* Globe Button */}
          <button
            onClick={onOpenCurrencyModal}
            aria-label="Language & Currency"
            className="w-9 h-9 rounded-full hover:bg-[#F7F7F7] text-[#222222] flex items-center justify-center transition cursor-pointer flex-shrink-0"
          >
            <Globe className="w-4 h-4 text-[#222222]" />
          </button>

          {/* Combined Pill Button for Menu & Profile */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 border border-[#DDDDDD] hover:shadow-md rounded-full pl-3.5 pr-2 py-1.5 transition cursor-pointer bg-white"
            >
              <Menu className="w-4 h-4 text-[#222222]" />
              <div className="w-7 h-7 rounded-full bg-[#717171] text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                {currentUser?.full_name ? (
                  currentUser.full_name.charAt(0).toUpperCase()
                ) : (
                  <UserIcon className="w-4 h-4 text-white" />
                )}
              </div>
            </button>

            {/* Dropdown Menu (Exact Replica of frame_060s.jpg) */}
            {menuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] border border-[#EBEBEB] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                {currentUser ? (
                  // Logged In Menu — matches shared screenshot exactly
                  <>
                    {/* Name + email header */}
                    <div className="px-4 py-3 border-b border-[#EBEBEB]">
                      <p className="text-[15px] font-semibold text-[#222222] truncate">{currentUser.full_name}</p>
                      <p className="text-sm text-[#717171] truncate">{currentUser.email}</p>
                    </div>

                    {/* Trips */}
                    <Link
                      href="/trips"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      Trips
                    </Link>

                    {/* Wishlists */}
                    <Link
                      href="/wishlists"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      Wishlists
                    </Link>

                    <div className="h-[1px] bg-[#EBEBEB]" />

                    {/* Switch to hosting */}
                    <Link
                      href="/host"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      {currentUser.role === "host" ? "Manage listings" : "Switch to hosting"}
                    </Link>

                    {/* Switch demo profile */}
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      Switch demo profile
                    </button>

                    <div className="h-[1px] bg-[#EBEBEB]" />

                    {/* Log out */}
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-[#717171] hover:bg-[#F7F7F7]"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  // Logged Out Menu — exact match of shared screenshot
                  <>
                    {/* Help Centre */}
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-4 py-3 text-sm text-[#222222] hover:bg-[#F7F7F7] flex items-center gap-3"
                    >
                      <HelpCircle className="w-[18px] h-[18px] text-[#222222] flex-shrink-0" />
                      <span>Help Centre</span>
                    </button>

                    <div className="h-[1px] bg-[#EBEBEB]" />

                    {/* Become a host — bold title + subtitle + red person illustration */}
                    <Link
                      href="/host"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 hover:bg-[#F7F7F7] transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-[#222222]">Become a host</p>
                          <p className="text-xs text-[#717171] mt-0.5 leading-snug max-w-[160px]">
                            It&apos;s easy to start hosting and earn extra income.
                          </p>
                        </div>
                        {/* Red-jacket person illustration from screenshot */}
                        <span className="text-3xl flex-shrink-0">🧍‍♀️</span>
                      </div>
                    </Link>

                    <div className="h-[1px] bg-[#EBEBEB]" />

                    {/* Refer a host */}
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-4 py-3 text-sm text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      Refer a host
                    </button>

                    {/* Find a co-host */}
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-4 py-3 text-sm text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      Find a co-host
                    </button>

                    <div className="h-[1px] bg-[#EBEBEB]" />

                    {/* Log in or sign up */}
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-[#222222] hover:bg-[#F7F7F7]"
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
