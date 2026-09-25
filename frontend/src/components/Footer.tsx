"use client";

import React from "react";
import { Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#F7F7F7] border-t border-[#EBEBEB] mt-auto">
      <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-16 py-10">
        
        {/* Link Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-[#EBEBEB] text-sm">
          <div>
            <h5 className="font-bold text-[#222222] mb-3">Support</h5>
            <ul className="space-y-2 text-[#717171]">
              <li className="hover:underline cursor-pointer">Help Centre</li>
              <li className="hover:underline cursor-pointer">AirCover</li>
              <li className="hover:underline cursor-pointer">Anti-discrimination</li>
              <li className="hover:underline cursor-pointer">Disability support</li>
              <li className="hover:underline cursor-pointer">Cancellation options</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[#222222] mb-3">Hosting</h5>
            <ul className="space-y-2 text-[#717171]">
              <li className="hover:underline cursor-pointer">Airbnb your home</li>
              <li className="hover:underline cursor-pointer">AirCover for Hosts</li>
              <li className="hover:underline cursor-pointer">Hosting resources</li>
              <li className="hover:underline cursor-pointer">Community forum</li>
              <li className="hover:underline cursor-pointer">Hosting responsibly</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[#222222] mb-3">Airbnb</h5>
            <ul className="space-y-2 text-[#717171]">
              <li className="hover:underline cursor-pointer">Newsroom</li>
              <li className="hover:underline cursor-pointer">New features</li>
              <li className="hover:underline cursor-pointer">Careers</li>
              <li className="hover:underline cursor-pointer">Investors</li>
              <li className="hover:underline cursor-pointer">Gift cards</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#717171] gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span>© 2026 Airbnb, Inc. · SDE Fullstack Assignment Clone</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Terms</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Sitemap</span>
          </div>

          <div className="flex items-center gap-4 font-semibold text-[#222222]">
            <button className="flex items-center gap-1.5 hover:underline">
              <Globe className="w-4 h-4" />
              <span>English (IN)</span>
            </button>
            <button className="hover:underline">
              <span>₹ INR</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
