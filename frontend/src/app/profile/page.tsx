"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { User } from "@/types";
import { fetchCurrentUser } from "@/lib/api";
import {
  MessageSquare,
  Users,
  User as UserIcon,
  CreditCard,
  Edit2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "connections">("about");
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("Hi! I love exploring new cities, good coffee, and cozy architecture.");
  const [savedBioToast, setSavedBioToast] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = await fetchCurrentUser().catch(() => null);
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

  const initial = currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : "D";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar
        onOpenAuthModal={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        onLogout={() => {
          localStorage.removeItem("airbnb_user_id");
          setCurrentUser(null);
        }}
      />

      <main className="max-w-[1120px] mx-auto px-6 sm:px-10 py-10 flex-1 w-full">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-16">
          {/* Left Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-6">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold text-[#222222]">Profile</h1>
              <CreditCard className="w-5 h-5 text-neutral-400 stroke-[1.8]" />
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("about")}
                className={`w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 text-sm transition cursor-pointer ${
                  activeTab === "about"
                    ? "bg-[#F2F2F2] font-semibold text-[#222222]"
                    : "text-[#717171] hover:text-[#222222] font-medium hover:bg-neutral-50"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-sm flex-shrink-0">
                  🧑‍💼
                </div>
                <span>About me</span>
              </button>

              <button
                onClick={() => setActiveTab("connections")}
                className={`w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 text-sm transition cursor-pointer ${
                  activeTab === "connections"
                    ? "bg-[#F2F2F2] font-semibold text-[#222222]"
                    : "text-[#717171] hover:text-[#222222] font-medium hover:bg-neutral-50"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sm flex-shrink-0">
                  👥
                </div>
                <span>Connections</span>
              </button>
            </nav>
          </div>

          {/* Right Main Content (Exact match to shared profile screenshot) */}
          <div className="flex-1 space-y-8">
            {activeTab === "about" ? (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-transparent">
                  <h2 className="text-3xl font-extrabold text-[#222222]">About me</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs font-semibold px-3.5 py-1.5 bg-[#F2F2F2] hover:bg-[#E5E5E5] rounded-full text-[#222222] transition cursor-pointer"
                  >
                    {isEditing ? "Done" : "Edit"}
                  </button>
                </div>

                {savedBioToast && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Profile updated successfully!</span>
                  </div>
                )}

                {/* Profile Card & Info Box */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mt-4">
                  {/* Left Big User Card */}
                  <div className="w-64 bg-white rounded-3xl p-8 border border-[#EBEBEB] shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center text-center flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-[#ECE9FE] text-[#5B4DF5] text-4xl font-extrabold flex items-center justify-center mb-4 shadow-xs">
                      {initial}
                    </div>
                    <h3 className="text-xl font-bold text-[#222222]">
                      {currentUser?.full_name || "D"}
                    </h3>
                    <p className="text-xs text-[#717171] mt-1 capitalize font-medium">
                      {currentUser?.role || "Guest"}
                    </p>
                    {currentUser?.is_superhost && (
                      <span className="mt-3 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-rose-100">
                        <Sparkles className="w-3 h-3" /> Superhost
                      </span>
                    )}
                  </div>

                  {/* Right "Complete your profile" Box */}
                  <div className="flex-1 space-y-3 pt-2">
                    <h4 className="text-xl font-bold text-[#222222]">
                      Complete your profile
                    </h4>
                    <p className="text-xs text-[#717171] leading-relaxed max-w-md">
                      Your Airbnb profile is an important part of every reservation. Create yours to help other hosts and guests get to know you.
                    </p>

                    {isEditing ? (
                      <div className="pt-2 space-y-3 max-w-md">
                        <textarea
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full text-xs p-3 rounded-2xl border border-neutral-300 focus:outline-hidden focus:border-black resize-none"
                        />
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setSavedBioToast(true);
                            setTimeout(() => setSavedBioToast(false), 4000);
                          }}
                          className="px-5 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Save bio
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="bg-[#E00B41] hover:bg-[#D70466] text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Get started
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[#EBEBEB] my-8" />

                {/* Show reviews I've written */}
                <div>
                  <Link
                    href="/trips"
                    className="inline-flex items-center gap-2.5 text-sm font-semibold text-[#222222] hover:underline"
                  >
                    <MessageSquare className="w-4 h-4 text-neutral-700" />
                    <span>Show reviews I've written</span>
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <h2 className="text-3xl font-extrabold text-[#222222]">Connections</h2>
                <p className="text-xs text-[#717171]">
                  Connect with friends, past hosts, or travel companions to see shared trips and recommendations.
                </p>
                <div className="p-8 border border-dashed border-neutral-200 rounded-3xl text-center space-y-2 bg-neutral-50/50">
                  <Users className="w-8 h-8 text-neutral-400 mx-auto" />
                  <p className="text-sm font-bold text-[#222222]">No connections yet</p>
                  <p className="text-xs text-[#717171]">Once you travel with others on Airbnb, they will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
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
