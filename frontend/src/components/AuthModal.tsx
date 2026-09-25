"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { User } from "@/types";
import { fetchDemoUsers, loginUser } from "@/lib/api";
import AirbnbLogo from "./AirbnbLogo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserLoggedIn?: (user: User) => void;
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onUserLoggedIn,
  onSuccess,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDemoUsers().then(setDemoUsers).catch(console.error);
    }
  }, [isOpen]);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const user = await loginUser(email.trim());
      if (onUserLoggedIn) onUserLoggedIn(user);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoUser = (user: User) => {
    localStorage.setItem("airbnb_user_id", user.id);
    if (onUserLoggedIn) onUserLoggedIn(user);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden cursor-default animate-in zoom-in-95 duration-150"
      >
        {/* Header — thin bar with centered title + left X, matching frame_003s */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBEBEB]">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F7F7F7] text-[#222222] transition"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-[15px] font-bold text-[#222222]">Log in or sign up</span>
          <div className="w-8" />
        </div>

        {/* Body */}
        <div className="px-6 pt-6 pb-8">
          {/* Airbnb logo mark */}
          <div className="flex justify-center mb-5">
            <AirbnbLogo className="w-10 h-10 text-[#FF385C]" showText={false} />
          </div>

          <h2 className="text-[22px] font-bold text-[#222222] mb-5">Log in or sign up</h2>

          {/* Email input */}
          <form onSubmit={handleCustomLogin} className="space-y-3">
            <input
              type="email"
              required
              placeholder="Phone number or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#B0B0B0] rounded-xl px-4 py-3.5 text-[15px] text-[#222222] placeholder:text-[#717171] focus:outline-none focus:border-[#222222] transition"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full airbnb-btn-gradient text-white font-semibold py-3.5 rounded-xl text-[15px] transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Continuing..." : "Continue"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 h-[1px] bg-[#EBEBEB]" />
            <span className="px-4 text-sm text-[#717171]">or</span>
            <div className="flex-1 h-[1px] bg-[#EBEBEB]" />
          </div>

          {/* Social buttons — Google + Apple side by side, matching frame_003s exactly */}
          <div className="flex items-center gap-3">
            <button className="flex-1 flex items-center justify-center gap-3 border border-[#DDDDDD] rounded-xl py-3 hover:bg-[#F7F7F7] transition cursor-pointer">
              {/* Google G */}
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button className="flex-1 flex items-center justify-center gap-3 border border-[#DDDDDD] rounded-xl py-3 hover:bg-[#F7F7F7] transition cursor-pointer">
              {/* Apple */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#222222]">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </button>
          </div>

          {/* Demo user fast-switch — hidden by default, shown via button */}
          <button
            onClick={() => setShowDemoUsers(!showDemoUsers)}
            className="mt-5 w-full text-center text-xs text-[#717171] hover:underline cursor-pointer"
          >
            {showDemoUsers ? "Hide demo profiles" : "Use a demo profile (testing only)"}
          </button>
          {showDemoUsers && demoUsers.length > 0 && (
            <div className="mt-3 space-y-2">
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectDemoUser(u)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-[#DDDDDD] hover:border-black hover:bg-slate-50 transition cursor-pointer text-left"
                >
                  <img
                    src={u.avatar_url}
                    alt={u.full_name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#222222]">
                      {u.full_name}
                      {u.is_superhost && (
                        <span className="ml-1.5 text-[10px] bg-rose-50 text-[#FF385C] px-1.5 py-0.5 rounded-md font-semibold">
                          Superhost
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-[#717171] capitalize">{u.role} · {u.email}</p>
                  </div>
                  <span className="ml-auto text-xs font-semibold text-[#FF385C]">Switch</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
