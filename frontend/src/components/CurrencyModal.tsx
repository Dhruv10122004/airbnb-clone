"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: string;
  onSelectCurrency: (code: string, symbol: string) => void;
}

// ─── Language + Region data (from frame_006s.jpg) ─────────────────────────────
const SUGGESTED_LANGUAGES = [
  { language: "English", region: "United Kingdom" },
  { language: "हिन्दी", region: "भारत" },
  { language: "English", region: "United States" },
  { language: "ಕನ್ನಡ", region: "ಭಾರತ" },
  { language: "मराठी", region: "भारत" },
];

const ALL_LANGUAGES = [
  { language: "English", region: "India" },
  { language: "Azərbaycan dili", region: "Azərbaycan" },
  { language: "Bahasa Indonesia", region: "Indonesia" },
  { language: "Bosanski", region: "Bosna i Hercegovina" },
  { language: "Català", region: "Espanya" },
  { language: "Čeština", region: "Česko" },
  { language: "Crnogorski", region: "Crna Gora" },
  { language: "Dansk", region: "Danmark" },
  { language: "Deutsch", region: "Deutschland" },
  { language: "Deutsch", region: "Österreich" },
  { language: "Deutsch", region: "Schweiz" },
  { language: "Eesti", region: "Eesti" },
  { language: "Español", region: "España" },
  { language: "Español", region: "América Latina" },
  { language: "Euskara", region: "Espainia" },
  { language: "Filipino", region: "Pilipinas" },
  { language: "Français", region: "France" },
  { language: "Français", region: "Belgique" },
  { language: "Français", region: "Canada" },
  { language: "Français", region: "Suisse" },
  { language: "Galego", region: "España" },
  { language: "Hrvatski", region: "Hrvatska" },
  { language: "isiZulu", region: "eNingizimu Afrika" },
  { language: "IsiXhosa", region: "iNingizimu Afrika" },
  { language: "Íslenska", region: "Ísland" },
  { language: "Italiano", region: "Italia" },
  { language: "Italiano", region: "Svizzera" },
  { language: "Kiswahili", region: "Afrika" },
  { language: "Latviešu", region: "Latvija" },
  { language: "Lietuvių", region: "Lietuva" },
  { language: "Magyar", region: "Magyarország" },
  { language: "Malti", region: "Malta" },
  { language: "Melayu", region: "Malaysia" },
  { language: "Vlaams", region: "België" },
  { language: "Nederlands", region: "Nederland" },
  { language: "Norsk", region: "Norge" },
  { language: "Polski", region: "Polska" },
  { language: "Português", region: "Brasil" },
  { language: "Português", region: "Portugal" },
  { language: "Română", region: "România" },
  { language: "Shqip", region: "Shqipëri" },
  { language: "Slovenčina", region: "Slovensko" },
  { language: "Slovenščina", region: "Slovenija" },
  { language: "Srpski", region: "Srbija" },
  { language: "Suomi", region: "Suomi" },
  { language: "Svenska", region: "Sverige" },
  { language: "Tagalog", region: "Pilipinas" },
  { language: "Tiếng Việt", region: "Việt Nam" },
  { language: "Türkçe", region: "Türkiye" },
  { language: "Ελληνικά", region: "Ελλάδα" },
  { language: "Български", region: "България" },
  { language: "Македонски", region: "Северна Македонија" },
  { language: "Русский", region: "Россия" },
  { language: "Українська", region: "Україна" },
  { language: "ქართული", region: "საქართველო" },
  { language: "Հայերեն", region: "Հայաստան" },
  { language: "עברית", region: "ישראל" },
  { language: "العربية", region: "العالم" },
  { language: "ไทย", region: "ประเทศไทย" },
  { language: "한국어", region: "대한민국" },
  { language: "日本語", region: "日本" },
  { language: "中文", region: "中国" },
  { language: "中文", region: "台灣" },
  { language: "中文", region: "香港" },
];

// ─── Currency data (from frame_015s.jpg) ──────────────────────────────────────
const CURRENCIES = [
  { name: "Argentine peso", code: "ARS", symbol: "$" },
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
  { name: "Kazakhstani tenge", code: "KZT", symbol: "₸" },
  { name: "Kenyan shilling", code: "KES", symbol: "KSh" },
  { name: "Malaysian ringgit", code: "MYR", symbol: "RM" },
  { name: "Mexican peso", code: "MXN", symbol: "$" },
  { name: "Moroccan dirham", code: "MAD", symbol: "MAD" },
  { name: "New Taiwan dollar", code: "TWD", symbol: "$" },
  { name: "New Zealand dollar", code: "NZD", symbol: "$" },
  { name: "Norwegian krone", code: "NOK", symbol: "kr" },
  { name: "Peruvian sol", code: "PEN", symbol: "S/" },
  { name: "Philippine peso", code: "PHP", symbol: "₱" },
  { name: "Polish zloty", code: "PLN", symbol: "zł" },
  { name: "Pound sterling", code: "GBP", symbol: "£" },
  { name: "Qatari riyal", code: "QAR", symbol: "ر.ق" },
  { name: "Romanian leu", code: "RON", symbol: "lei" },
  { name: "Saudi Arabian riyal", code: "SAR", symbol: "SR" },
  { name: "Singapore dollar", code: "SGD", symbol: "$" },
  { name: "South African rand", code: "ZAR", symbol: "R" },
  { name: "South Korean won", code: "KRW", symbol: "₩" },
  { name: "Swedish krona", code: "SEK", symbol: "kr" },
  { name: "Swiss franc", code: "CHF", symbol: "CHF" },
  { name: "Thai baht", code: "THB", symbol: "฿" },
  { name: "Turkish lira", code: "TRY", symbol: "₺" },
  { name: "Ugandan shilling", code: "UGX", symbol: "USh" },
  { name: "Ukrainian hryvnia", code: "UAH", symbol: "₴" },
  { name: "United States dollar", code: "USD", symbol: "$" },
  { name: "Uruguayan peso", code: "UYU", symbol: "$U" },
  { name: "Vietnamese dong", code: "VND", symbol: "₫" },
];

type Tab = "language" | "currency";

export default function CurrencyModal({
  isOpen,
  onClose,
  selectedCurrency,
  onSelectCurrency,
}: CurrencyModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("language");
  const [translationEnabled, setTranslationEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("English\nIndia");

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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden cursor-default animate-in zoom-in-95 duration-150"
      >
        {/* Top: X button + two tabs */}
        <div className="flex-shrink-0">
          <div className="flex items-center px-6 pt-5 pb-0">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#F7F7F7] text-[#222222] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Tab row */}
          <div className="flex px-6 border-b border-[#DDDDDD] mt-2">
            <button
              onClick={() => setActiveTab("language")}
              className={`pb-3 mr-8 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "language"
                  ? "border-[#222222] text-[#222222]"
                  : "border-transparent text-[#717171] hover:text-[#222222]"
              }`}
            >
              Language and region
            </button>
            <button
              onClick={() => setActiveTab("currency")}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "currency"
                  ? "border-[#222222] text-[#222222]"
                  : "border-transparent text-[#717171] hover:text-[#222222]"
              }`}
            >
              Currency
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-8 py-6">
          {activeTab === "language" ? (
            <>
              {/* Translation toggle */}
              <div className="bg-[#F7F7F7] rounded-xl p-4 flex items-center justify-between mb-8 max-w-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌐</span>
                  <div>
                    <p className="text-sm font-semibold text-[#222222]">Translation</p>
                    <p className="text-sm text-[#717171]">Automatically translate descriptions and reviews to English.</p>
                  </div>
                </div>
                <button
                  onClick={() => setTranslationEnabled(!translationEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${
                    translationEnabled ? "bg-[#222222]" : "bg-[#DDDDDD]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      translationEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                  {translationEnabled && (
                    <svg className="absolute right-1.5 top-1 w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 2.5L4.5 8 2 5.5l-1 1 3.5 3.5 6.5-6.5z"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Suggested languages */}
              <h3 className="text-base font-bold text-[#222222] mb-4">Suggested languages and regions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
                {SUGGESTED_LANGUAGES.map((lang, idx) => {
                  const key = `${lang.language}\n${lang.region}`;
                  const isSelected = selectedLanguage === key;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedLanguage(key)}
                      className={`p-3 rounded-xl text-left border transition cursor-pointer ${
                        isSelected
                          ? "border-[#222222] ring-1 ring-[#222222]"
                          : "border-transparent hover:border-[#DDDDDD] hover:bg-[#F7F7F7]"
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#222222]">{lang.language}</p>
                      <p className="text-xs text-[#717171] mt-0.5">{lang.region}</p>
                    </button>
                  );
                })}
              </div>

              {/* All languages */}
              <h3 className="text-base font-bold text-[#222222] mb-4">Choose a language and region</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {ALL_LANGUAGES.map((lang, idx) => {
                  const key = `${lang.language}\n${lang.region}`;
                  const isSelected = selectedLanguage === key;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedLanguage(key)}
                      className={`p-3 rounded-xl text-left border transition cursor-pointer ${
                        isSelected
                          ? "border-[#222222] ring-1 ring-[#222222]"
                          : "border-transparent hover:border-[#DDDDDD] hover:bg-[#F7F7F7]"
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#222222]">{lang.language}</p>
                      <p className="text-xs text-[#717171] mt-0.5">{lang.region}</p>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Currency tab */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {CURRENCIES.map((curr, idx) => {
                const isSelected = selectedCurrency === curr.code;
                return (
                  <button
                    key={`${curr.code}-${idx}`}
                    onClick={() => {
                      onSelectCurrency(curr.code, curr.symbol);
                      onClose();
                    }}
                    className={`p-3 rounded-xl text-left border transition cursor-pointer ${
                      isSelected
                        ? "border-[#222222] ring-1 ring-[#222222]"
                        : "border-transparent hover:border-[#DDDDDD] hover:bg-[#F7F7F7]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#222222] leading-tight">{curr.name}</p>
                    <p className="text-xs text-[#717171] mt-1 font-mono">
                      {curr.code} – {curr.symbol}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
