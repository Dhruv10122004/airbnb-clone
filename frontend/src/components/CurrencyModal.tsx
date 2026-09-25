"use client";

import React, { useState } from "react";
import { X, Check } from "lucide-react";

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: string;
  onSelectCurrency: (code: string, symbol: string) => void;
}

const CURRENCIES = [
  { name: "Australian dollar", code: "AUD", symbol: "$" },
  { name: "Brazilian real", code: "BRL", symbol: "R$" },
  { name: "Bulgarian lev", code: "BGN", symbol: "лв" },
  { name: "Canadian dollar", code: "CAD", symbol: "$" },
  { name: "Chilean peso", code: "CLP", symbol: "$" },
  { name: "Chinese yuan", code: "CNY", symbol: "¥" },
  { name: "Colombian peso", code: "COP", symbol: "$" },
  { name: "Costa Rican colón", code: "CRC", symbol: "₡" },
  { name: "Croatian kuna", code: "HRK", symbol: "kn" },
  { name: "Czech koruna", code: "CZK", symbol: "Kč" },
  { name: "Danish krone", code: "DKK", symbol: "kr" },
  { name: "Emirati dirham", code: "AED", symbol: "د.إ" },
  { name: "Euro", code: "EUR", symbol: "€" },
  { name: "Hong Kong dollar", code: "HKD", symbol: "$" },
  { name: "Hungarian forint", code: "HUF", symbol: "Ft" },
  { name: "Indian rupee", code: "INR", symbol: "₹" },
  { name: "Indonesian rupiah", code: "IDR", symbol: "Rp" },
  { name: "Israeli new shekel", code: "ILS", symbol: "₪" },
  { name: "Japanese yen", code: "JPY", symbol: "¥" },
  { name: "Kenyan shilling", code: "KES", symbol: "KSh" },
  { name: "Malaysian ringgit", code: "MYR", symbol: "RM" },
  { name: "Mexican peso", code: "MXN", symbol: "$" },
  { name: "Moroccan dirham", code: "MAD", symbol: "د.م." },
  { name: "New Zealand dollar", code: "NZD", symbol: "$" },
  { name: "Norwegian krone", code: "NOK", symbol: "kr" },
  { name: "Philippine peso", code: "PHP", symbol: "₱" },
  { name: "Polish zloty", code: "PLN", symbol: "zł" },
  { name: "Pound sterling", code: "GBP", symbol: "£" },
  { name: "Qatari riyal", code: "QAR", symbol: "ر.ق" },
  { name: "Saudi riyal", code: "SAR", symbol: "ر.س" },
  { name: "Singapore dollar", code: "SGD", symbol: "$" },
  { name: "South African rand", code: "ZAR", symbol: "R" },
  { name: "South Korean won", code: "KRW", symbol: "₩" },
  { name: "Swedish krona", code: "SEK", symbol: "kr" },
  { name: "Swiss franc", code: "CHF", symbol: "CHF" },
  { name: "Thai baht", code: "THB", symbol: "฿" },
  { name: "Turkish lira", code: "TRY", symbol: "₺" },
  { name: "United States dollar", code: "USD", symbol: "$" },
  { name: "Vietnamese dong", code: "VND", symbol: "₫" },
];

export default function CurrencyModal({
  isOpen,
  onClose,
  selectedCurrency,
  onSelectCurrency,
}: CurrencyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header with Top-Left Close Button as in Spec */}
        <div className="p-6 border-b border-[#EBEBEB] flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-[#222222] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-base font-bold text-[#222222]">Choose a currency</h3>
          <div className="w-9" />
        </div>

        {/* 5-Column Desktop Grid of Currencies */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {CURRENCIES.map((curr) => {
              const isSelected = selectedCurrency === curr.code;
              return (
                <button
                  key={curr.code}
                  onClick={() => {
                    onSelectCurrency(curr.code, curr.symbol);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-black bg-slate-50 ring-1 ring-black"
                      : "border-transparent hover:border-gray-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-sm font-semibold text-[#222222] line-clamp-1">
                    {curr.name}
                  </span>
                  <span className="text-xs text-[#717171] mt-1 font-mono">
                    {curr.code} – {curr.symbol}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
