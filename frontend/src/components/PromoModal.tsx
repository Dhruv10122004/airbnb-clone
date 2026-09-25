"use client";

import React from "react";
import { X, Sparkles } from "lucide-react";

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim: () => void;
}

export default function PromoModal({ isOpen, onClose, onClaim }: PromoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-150 p-6 text-center">
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-[#717171] hover:text-black transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 3D House on Platform Illustration */}
        <div className="w-32 h-32 mx-auto my-4 bg-gradient-to-tr from-rose-100 to-amber-100 rounded-3xl flex items-center justify-center shadow-inner relative">
          <span className="text-6xl drop-shadow-md select-none">🏝️</span>
          <div className="absolute -top-1 -right-1 bg-white p-1 rounded-full shadow-md">
            <Sparkles className="w-4 h-4 text-[#FF385C]" />
          </div>
        </div>

        {/* Bold Headline */}
        <h3 className="text-2xl font-bold text-[#222222] tracking-tight mt-2">
          Take 10% off your next stay
        </h3>

        {/* Subtext with Underlined Terms */}
        <p className="text-sm text-[#717171] mt-2 leading-relaxed">
          For new guests in selected countries only.{" "}
          <button className="underline text-[#222222] font-semibold cursor-pointer">
            Terms apply
          </button>
        </p>

        {/* Pink Gradient Claim Button */}
        <button
          onClick={() => {
            onClose();
            onClaim();
          }}
          className="w-full mt-6 airbnb-btn-gradient text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
        >
          Log in to claim offer
        </button>
      </div>
    </div>
  );
}
