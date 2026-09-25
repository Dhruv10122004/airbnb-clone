"use client";

import React, { useState } from "react";
import { X, Check } from "lucide-react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: {
    min_price?: number;
    max_price?: number;
    property_type?: string;
    amenities?: string;
  }) => void;
  initialFilters?: {
    min_price?: number;
    max_price?: number;
    property_type?: string;
    amenities?: string;
  };
}

const PROPERTY_TYPES = ["All", "Flat", "Villa", "Farm stay", "Cabin", "Loft"];

const AMENITIES_LIST = [
  "Wifi",
  "Kitchen",
  "Private pool",
  "Air conditioning",
  "Dedicated workspace",
  "Free parking on premises",
  "Hot tub / Jacuzzi",
  "Mountain view",
  "Beach access",
];

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  initialFilters = {},
}: FilterModalProps) {
  const [minPrice, setMinPrice] = useState<number | "">(initialFilters.min_price || "");
  const [maxPrice, setMaxPrice] = useState<number | "">(initialFilters.max_price || "");
  const [propertyType, setPropertyType] = useState<string>(initialFilters.property_type || "All");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialFilters.amenities ? initialFilters.amenities.split(",") : []
  );

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

  const toggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  const handleApply = () => {
    onApply({
      min_price: minPrice !== "" ? Number(minPrice) : undefined,
      max_price: maxPrice !== "" ? Number(maxPrice) : undefined,
      property_type: propertyType !== "All" ? propertyType : undefined,
      amenities: selectedAmenities.length ? selectedAmenities.join(",") : undefined,
    });
    onClose();
  };

  const handleClear = () => {
    setMinPrice("");
    setMaxPrice("");
    setPropertyType("All");
    setSelectedAmenities([]);
    onApply({});
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150 cursor-default"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EBEBEB]">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-[#717171]"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-base font-bold text-[#222222]">Filters</h3>
          <div className="w-9" />
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Price Range */}
          <div>
            <h4 className="text-base font-bold text-[#222222] mb-1">Price range</h4>
            <p className="text-xs text-[#717171] mb-4">Nightly prices before taxes and fees</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 border border-gray-300 rounded-2xl p-3 focus-within:border-black">
                <label className="block text-[11px] font-bold text-[#717171]">Minimum</label>
                <div className="flex items-center mt-1">
                  <span className="text-sm font-semibold mr-1">₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
                    className="w-full text-sm font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <span className="text-gray-400 font-bold">-</span>

              <div className="flex-1 border border-gray-300 rounded-2xl p-3 focus-within:border-black">
                <label className="block text-[11px] font-bold text-[#717171]">Maximum</label>
                <div className="flex items-center mt-1">
                  <span className="text-sm font-semibold mr-1">₹</span>
                  <input
                    type="number"
                    placeholder="50,000+"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
                    className="w-full text-sm font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-[#EBEBEB]" />

          {/* Property Type */}
          <div>
            <h4 className="text-base font-bold text-[#222222] mb-3">Property type</h4>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => {
                const isSelected = propertyType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setPropertyType(type)}
                    className={`py-2 px-4 rounded-full text-xs font-semibold border transition ${
                      isSelected
                        ? "border-black bg-black text-white"
                        : "border-[#DDDDDD] text-[#222222] hover:border-black"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-[#EBEBEB]" />

          {/* Amenities */}
          <div>
            <h4 className="text-base font-bold text-[#222222] mb-3">Amenities</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AMENITIES_LIST.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer select-none"
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                        isChecked
                          ? "bg-black border-black text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-sm text-[#222222]">{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#EBEBEB] flex items-center justify-between bg-white rounded-b-3xl">
          <button
            onClick={handleClear}
            className="text-sm font-bold text-[#222222] underline hover:text-black cursor-pointer"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="bg-[#222222] hover:bg-black text-white text-sm font-bold py-3 px-6 rounded-xl transition cursor-pointer"
          >
            Show stays
          </button>
        </div>

      </div>
    </div>
  );
}
