"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ListingDetail, User, Booking } from "@/types";
import {
  X,
  CreditCard,
  Smartphone,
  Building,
  ShieldCheck,
  Star,
  Calendar,
  Users,
  CheckCircle2,
  Lock,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Info,
} from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingDetail;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totals: {
    nights: number;
    basePrice: number;
    cleaningFee: number;
    serviceFee: number;
    total: number;
  };
  currentUser: User | null;
  onConfirmBooking: (paymentMethod: string) => Promise<Booking>;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  listing,
  checkIn,
  checkOut,
  guestCount,
  totals,
  currentUser,
  onConfirmBooking,
}: CheckoutModalProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Mock card form state
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8821");
  const [cardExpiry, setCardExpiry] = useState("08/29");
  const [cardCvv, setCardCvv] = useState("321");
  const [cardName, setCardName] = useState(currentUser?.full_name || "Demo Traveler");

  // Mock UPI state
  const [upiId, setUpiId] = useState("guest@okaxis");

  if (!isOpen) return null;

  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handlePay = async () => {
    setIsProcessing(true);
    setCheckoutError(null);
    try {
      // Simulate realistic payment gateway authorization delay (1.2s)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const booking = await onConfirmBooking(paymentMethod);
      setConfirmedBooking(booking);
    } catch (err: any) {
      setCheckoutError(err.message || "Payment authorization failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (confirmedBooking) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="text-center space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Reservation Confirmed
            </span>
            <h3 className="text-2xl font-extrabold text-[#222222] pt-1">
              You&apos;re going to {listing.city}!
            </h3>
            <p className="text-xs text-[#717171]">
              A confirmation email and receipt have been dispatched to{" "}
              <span className="font-semibold text-black">{currentUser?.email || "your account"}</span>.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 space-y-3 text-xs text-[#222222]">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200">
              <img
                src={listing.images?.[0]?.url || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"}
                alt={listing.title}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-[#222222] truncate">{listing.title}</h4>
                <p className="text-xs text-[#717171]">{listing.city}, {listing.country}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#717171]">Confirmation Code</span>
              <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                HM-{confirmedBooking.id.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#717171]">Dates</span>
              <span className="font-semibold">
                {formatDateDisplay(confirmedBooking.check_in)} – {formatDateDisplay(confirmedBooking.check_out)} ({confirmedBooking.total_nights} nights)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#717171]">Guests</span>
              <span className="font-semibold">{confirmedBooking.guest_count} guest{confirmedBooking.guest_count > 1 ? "s" : ""}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-neutral-200 text-sm font-bold">
              <span>Amount Paid</span>
              <span className="text-emerald-700 font-extrabold">
                ₹{confirmedBooking.total_price.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => {
                onClose();
                router.push("/trips");
              }}
              className="w-full bg-black text-white py-3.5 rounded-xl text-sm font-bold hover:bg-neutral-800 transition cursor-pointer shadow-sm"
            >
              Go to My Trips
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold text-[#717171] hover:text-black transition cursor-pointer"
            >
              Done / Return to listing
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CHECKOUT FORM VIEW
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-[#EBEBEB] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-[#EBEBEB] flex items-center justify-between flex-shrink-0 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center cursor-pointer transition text-[#222222]"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-[#222222]">Confirm and pay</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#717171]">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure checkout</span>
          </div>
        </div>

        {/* Modal Body: Two Columns */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          
          {/* Left Column: Booking Details & Payment Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Trip Details Section */}
            <div>
              <h3 className="text-base font-bold text-[#222222] mb-3">Your trip</h3>
              
              <div className="border border-[#DDDDDD] rounded-2xl p-4 space-y-3.5 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#222222] mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#222222] uppercase tracking-wider">Dates</h4>
                      <p className="text-sm font-semibold text-[#222222]">
                        {formatDateDisplay(checkIn)} – {formatDateDisplay(checkOut)}
                      </p>
                      <p className="text-xs text-[#717171]">{totals.nights} night{totals.nights > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-[#EBEBEB]" />

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-[#222222] mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#222222] uppercase tracking-wider">Guests</h4>
                      <p className="text-sm font-semibold text-[#222222]">
                        {guestCount} guest{guestCount > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#222222]">Pay with</h3>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Mocked Payment
                </span>
              </div>

              {/* Payment Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    paymentMethod === "card"
                      ? "bg-white text-[#222222] shadow-xs"
                      : "text-[#717171] hover:text-[#222222]"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    paymentMethod === "upi"
                      ? "bg-white text-[#222222] shadow-xs"
                      : "text-[#717171] hover:text-[#222222]"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    paymentMethod === "netbanking"
                      ? "bg-white text-[#222222] shadow-xs"
                      : "text-[#717171] hover:text-[#222222]"
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* Payment Details Container */}
              <div className="border border-[#DDDDDD] rounded-2xl p-4 bg-white space-y-3">
                {paymentMethod === "card" && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-[#717171] uppercase tracking-wider mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="w-full p-2.5 border border-[#CCCCCC] rounded-xl font-mono text-xs focus:outline-black"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#717171] uppercase tracking-wider mb-1">
                          Expiration
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full p-2.5 border border-[#CCCCCC] rounded-xl text-xs focus:outline-black"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#717171] uppercase tracking-wider mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full p-2.5 border border-[#CCCCCC] rounded-xl text-xs focus:outline-black"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#717171] uppercase tracking-wider mb-1">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full p-2.5 border border-[#CCCCCC] rounded-xl text-xs focus:outline-black"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <div className="space-y-3 text-xs">
                    <p className="text-[#717171]">
                      Pay instantly with Google Pay, PhonePe, Paytm, or enter your UPI ID below.
                    </p>
                    <div>
                      <label className="block text-[11px] font-bold text-[#717171] uppercase tracking-wider mb-1">
                        UPI ID / VPA
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okhdfcbank"
                        className="w-full p-2.5 border border-[#CCCCCC] rounded-xl font-mono text-xs focus:outline-black"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      {["Google Pay", "PhonePe", "Paytm"].map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => setUpiId(`demo@${app.toLowerCase().replace(" ", "")}`)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-semibold hover:border-black transition"
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === "netbanking" && (
                  <div className="space-y-2 text-xs">
                    <p className="text-[#717171]">Select from popular Indian banks:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank"].map((bank, i) => (
                        <label
                          key={bank}
                          className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 hover:border-black cursor-pointer"
                        >
                          <input type="radio" name="bank" defaultChecked={i === 0} />
                          <span className="font-semibold text-xs text-[#222222]">{bank}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cancellation Policy Banner */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-[#222222] space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Free cancellation for 48 hours</span>
              </div>
              <p className="text-[#717171]">
                Full refund if you cancel at least 48 hours before check-in.
              </p>
            </div>

            {/* Error Message */}
            {checkoutError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
                {checkoutError}
              </div>
            )}

            {/* Agreement & CTA */}
            <div className="space-y-3 pt-2">
              <p className="text-[11px] text-[#717171] leading-relaxed">
                By selecting the button below, you agree to the Host&apos;s House Rules, Ground Rules for guests,
                and Airbnb&apos;s Rebooking and Refund Policy.
              </p>

              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full bg-[#E00B41] hover:bg-[#D70466] text-white font-bold py-4 rounded-xl text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing payment...</span>
                  </>
                ) : (
                  <span>Confirm and Pay ₹{totals.total.toLocaleString("en-IN")}</span>
                )}
              </button>
            </div>

          </div>

          {/* Right Column: Listing & Price Breakdown Card */}
          <div className="lg:col-span-5">
            <div className="border border-[#DDDDDD] rounded-3xl p-5 shadow-xs space-y-4 bg-white sticky top-4">
              
              {/* Listing Card Preview */}
              <div className="flex gap-3 pb-4 border-b border-[#EBEBEB]">
                <img
                  src={listing.images?.[0]?.url || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"}
                  alt={listing.title}
                  className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <span className="text-[11px] text-[#717171] uppercase tracking-wider font-bold">
                      {listing.property_type}
                    </span>
                    <h4 className="text-sm font-bold text-[#222222] line-clamp-2 leading-snug mt-0.5">
                      {listing.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3.5 h-3.5 fill-black text-black" />
                    <span className="font-bold text-[#222222]">{listing.average_rating}</span>
                    <span className="text-[#717171]">({listing.review_count || listing.reviews?.length || 0} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Protection Badge */}
              <div className="flex items-center gap-2 text-xs text-[#222222] bg-neutral-50 p-3 rounded-2xl">
                <span className="text-base">🛡️</span>
                <p className="text-[11px] text-[#717171]">
                  Your booking is protected by <span className="font-bold text-black">AirCover</span>.
                </p>
              </div>

              {/* Price Details */}
              <div className="space-y-3 pt-2 text-xs text-[#222222]">
                <h4 className="text-sm font-bold text-[#222222]">Price details</h4>
                
                <div className="flex justify-between">
                  <span className="text-[#717171]">
                    ₹{listing.price_per_night.toLocaleString("en-IN")} × {totals.nights} night{totals.nights > 1 ? "s" : ""}
                  </span>
                  <span className="font-medium">₹{totals.basePrice.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#717171]">Cleaning fee</span>
                  <span className="font-medium">₹{totals.cleaningFee.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#717171]">Airbnb service fee</span>
                  <span className="font-medium">₹{totals.serviceFee.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t border-[#EBEBEB] text-sm font-bold">
                  <span>Total (INR)</span>
                  <span className="text-base text-black">₹{totals.total.toLocaleString("en-IN")}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
