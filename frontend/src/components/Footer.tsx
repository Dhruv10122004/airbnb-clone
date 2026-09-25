"use client";

import React from "react";
import { Globe } from "lucide-react";


export default function Footer() {
  return (
    <footer className="bg-[#F7F7F7] border-t border-[#EBEBEB] mt-auto">
      <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-16 py-10">
        
        {/* Link Columns — exactly matching frame_012s.jpg of rec2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-[#EBEBEB] text-sm">
          <div>
            <h5 className="font-bold text-[#222222] mb-4">Support</h5>
            <ul className="space-y-3 text-[#222222]">
              <li className="hover:underline cursor-pointer">Help Centre</li>
              <li className="hover:underline cursor-pointer">Get help with a safety issue</li>
              <li className="hover:underline cursor-pointer">AirCover</li>
              <li className="hover:underline cursor-pointer">Anti-discrimination</li>
              <li className="hover:underline cursor-pointer">Disability support</li>
              <li className="hover:underline cursor-pointer">Cancellation options</li>
              <li className="hover:underline cursor-pointer">Report neighbourhood concern</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[#222222] mb-4">Hosting</h5>
            <ul className="space-y-3 text-[#222222]">
              <li className="hover:underline cursor-pointer">Airbnb your home</li>
              <li className="hover:underline cursor-pointer">Airbnb your experience</li>
              <li className="hover:underline cursor-pointer">Airbnb your service</li>
              <li className="hover:underline cursor-pointer">AirCover for Hosts</li>
              <li className="hover:underline cursor-pointer">Hosting resources</li>
              <li className="hover:underline cursor-pointer">Community forum</li>
              <li className="hover:underline cursor-pointer">Hosting responsibly</li>
              <li className="hover:underline cursor-pointer">Join a free hosting class</li>
              <li className="hover:underline cursor-pointer">Find a co-host</li>
              <li className="hover:underline cursor-pointer">Refer a host</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[#222222] mb-4">Airbnb</h5>
            <ul className="space-y-3 text-[#222222]">
              <li className="hover:underline cursor-pointer">2026 Summer Release</li>
              <li className="hover:underline cursor-pointer">Newsroom</li>
              <li className="hover:underline cursor-pointer">Careers</li>
              <li className="hover:underline cursor-pointer">Investors</li>
              <li className="hover:underline cursor-pointer">Airbnb.org emergency stays</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar — matching frame_012s.jpg: left = copyright + Privacy/Terms/Company details, right = language + currency + social icons */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#222222] gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span>© 2026 Airbnb, Inc.</span>
            <span className="text-[#717171]">·</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span className="text-[#717171]">·</span>
            <span className="hover:underline cursor-pointer">Terms</span>
            <span className="text-[#717171]">·</span>
            <span className="hover:underline cursor-pointer">Company details</span>
          </div>

          <div className="flex items-center gap-5">
            <button className="flex items-center gap-1.5 font-semibold hover:underline">
              <Globe className="w-4 h-4" />
              <span>English (IN)</span>
            </button>
            <button className="font-semibold hover:underline">
              <span>₹ INR</span>
            </button>
            <div className="flex items-center gap-4 ml-2">
              {/* Facebook */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[18px] h-[18px] cursor-pointer hover:opacity-70 fill-current">
                <path d="M24 12.073C24 5.406 18.627 0 12 0S0 5.406 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49H13.874V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              {/* X (Twitter) */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[18px] h-[18px] cursor-pointer hover:opacity-70 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              {/* Instagram */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[18px] h-[18px] cursor-pointer hover:opacity-70 fill-current">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
