"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, ShieldCheck } from "lucide-react";
import { User } from "@/types";
import { fetchDemoUsers, loginUser } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserLoggedIn: (user: User) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onUserLoggedIn,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDemoUsers().then(setDemoUsers).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const user = await loginUser(email.trim());
      onUserLoggedIn(user);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoUser = (user: User) => {
    localStorage.setItem("airbnb_user_id", user.id);
    onUserLoggedIn(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#EBEBEB] relative">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-[#222222]"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-[#222222]">Log in or sign up</span>
          <div className="w-8" />
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-[#222222] mb-4">
            Welcome to Airbnb
          </h3>

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div className="border border-gray-300 rounded-xl p-3 focus-within:border-black">
              <label className="block text-[11px] font-bold text-[#717171]">Email</label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm font-medium mt-0.5 focus:outline-none bg-transparent"
              />
            </div>

            <p className="text-[11px] text-[#717171]">
              We’ll verify your account credentials or sign you in instantly for this assignment demo.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full airbnb-btn-gradient text-white font-semibold py-3 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Continuing..." : "Continue"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-1 h-[1px] bg-[#EBEBEB]" />
            <span className="px-3 text-xs font-semibold text-[#717171]">or test with demo profile</span>
            <div className="flex-1 h-[1px] bg-[#EBEBEB]" />
          </div>

          {/* Demo User Fast-Switch Cards */}
          <div className="space-y-2">
            {demoUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => handleSelectDemoUser(u)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#DDDDDD] hover:border-black hover:bg-slate-50 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar_url}
                    alt={u.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#222222] flex items-center gap-1">
                      {u.full_name}
                      {u.is_superhost && (
                        <span className="text-[10px] bg-rose-50 text-[#FF385C] px-1.5 py-0.5 rounded-md font-semibold">
                          Superhost
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-[#717171] capitalize">{u.role} account · {u.email}</p>
                  </div>
                </div>
                <div className="text-xs font-semibold text-[#FF385C]">Switch</div>
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
