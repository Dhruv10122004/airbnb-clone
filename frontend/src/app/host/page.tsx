"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { ListingSummary, Booking, HostStats, User } from "@/types";
import {
  fetchHostStats,
  fetchHostListings,
  fetchHostReservations,
  createHostListing,
  deleteHostListing,
  fetchCurrentUser,
} from "@/lib/api";
import {
  Plus,
  Trash2,
  Edit,
  DollarSign,
  Home,
  Calendar,
  CheckCircle,
  X,
  ExternalLink,
} from "lucide-react";

export default function HostDashboardPage() {
  const [stats, setStats] = useState<HostStats | null>(null);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create Listing Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("Flat");
  const [category, setCategory] = useState("popular");
  const [city, setCity] = useState("Noida");
  const [country, setCountry] = useState("India");
  const [pricePerNight, setPricePerNight] = useState(6500);
  const [cleaningFee, setCleaningFee] = useState(700);
  const [maxGuests, setMaxGuests] = useState(4);
  const [bedrooms, setBedrooms] = useState(2);
  const [beds, setBeds] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [photosInput, setPhotosInput] = useState(
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200\nhttps://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800\nhttps://images.unsplash.com/photo-1484154218962-a197022b5858?w=800\nhttps://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800\nhttps://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800"
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Wifi",
    "Kitchen",
    "Air conditioning",
    "Free parking on premises",
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hostStats, hostListings, hostRes, user] = await Promise.all([
        fetchHostStats().catch(() => null),
        fetchHostListings().catch(() => []),
        fetchHostReservations().catch(() => []),
        fetchCurrentUser().catch(() => null),
      ]);
      setStats(hostStats);
      setListings(hostListings);
      setReservations(hostRes);
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

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing? All associated bookings will be affected.")) {
      return;
    }
    try {
      await deleteHostListing(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete listing");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setCreating(true);

    const imageUrls = photosInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await createHostListing({
        title,
        description,
        property_type: propertyType,
        category,
        city,
        country,
        price_per_night: Number(pricePerNight),
        cleaning_fee: Number(cleaningFee),
        max_guests: Number(maxGuests),
        bedrooms: Number(bedrooms),
        beds: Number(beds),
        bathrooms: Number(bathrooms),
        amenities: selectedAmenities,
        image_urls: imageUrls,
        is_guest_favourite: true,
      });

      setIsCreateOpen(false);
      // Reset
      setTitle("");
      setDescription("");
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to create listing");
    } finally {
      setCreating(false);
    }
  };

  const allAmenitiesOptions = [
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

  const toggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7]">
      <Navbar
        onOpenAuthModal={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        onLogout={() => {
          localStorage.removeItem("airbnb_user_id");
          setCurrentUser(null);
          loadData();
        }}
      />

      <main className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10 flex-1 w-full space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-[#222222]">Host Dashboard</h1>
              {currentUser?.is_superhost && (
                <span className="text-xs bg-rose-50 text-[#FF385C] border border-rose-200 font-bold px-2 py-0.5 rounded-full">
                  ★ Superhost
                </span>
              )}
            </div>
            <p className="text-sm text-[#717171] mt-1">
              Hosting as {currentUser?.full_name || "Host User"} · Manage listings, review earnings, and check reservations
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="airbnb-btn-gradient text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Create new listing</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#EBEBEB] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#FF385C] flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#717171] uppercase tracking-wider">Properties Listed</span>
              <p className="text-2xl font-black text-[#222222] mt-0.5">{stats?.total_listings || listings.length}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EBEBEB] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#717171] uppercase tracking-wider">Bookings Received</span>
              <p className="text-2xl font-black text-[#222222] mt-0.5">{stats?.total_reservations || reservations.length}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EBEBEB] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#717171] uppercase tracking-wider">Host Payouts</span>
              <p className="text-2xl font-black text-[#222222] mt-0.5">
                ₹{(stats?.total_earnings || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Your Active Listings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBEBEB] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#222222]">Your Listings ({listings.length})</h3>
            <span className="text-xs text-[#717171]">Full CRUD available</span>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
              <p className="text-sm font-semibold text-[#717171]">You haven&apos;t created any listings yet.</p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="mt-3 text-xs font-bold text-[#FF385C] underline"
              >
                Create your first listing now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((l) => (
                <div
                  key={l.id}
                  className="border border-[#EBEBEB] rounded-2xl overflow-hidden hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[16/10] relative bg-neutral-100">
                      <img
                        src={l.cover_image}
                        alt={l.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 text-xs font-bold px-2 py-0.5 rounded-full shadow-xs">
                        {l.property_type}
                      </div>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <h4 className="font-bold text-sm text-[#222222] line-clamp-1">{l.title}</h4>
                      <p className="text-xs text-[#717171]">{l.city}, {l.country}</p>
                      <p className="text-xs font-semibold text-black pt-1">
                        ₹{l.price_per_night.toLocaleString("en-IN")} / night
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border-t border-[#EBEBEB] flex items-center justify-between text-xs font-semibold">
                    <Link
                      href={`/rooms/${l.id}`}
                      target="_blank"
                      className="text-[#717171] hover:text-black flex items-center gap-1"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <button
                      onClick={() => handleDeleteListing(l.id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Incoming Guest Reservations */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBEBEB] shadow-xs space-y-6">
          <h3 className="text-xl font-bold text-[#222222]">
            Guest Reservations Received ({reservations.length})
          </h3>

          {reservations.length === 0 ? (
            <p className="text-xs text-[#717171] py-4">No reservations booked on your properties yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EBEBEB] text-[#717171] uppercase tracking-wider font-bold">
                    <th className="pb-3">Listing</th>
                    <th className="pb-3">Dates</th>
                    <th className="pb-3">Guests</th>
                    <th className="pb-3">Payout</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEBEB]">
                  {reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-[#222222]">{res.listing?.title}</td>
                      <td className="py-3 text-[#717171]">{res.check_in} → {res.check_out} ({res.total_nights} nights)</td>
                      <td className="py-3">{res.guest_count} guests</td>
                      <td className="py-3 font-bold text-emerald-700">₹{res.total_price.toLocaleString("en-IN")}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          res.status === "confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }`}>
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* Create Listing Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-[#EBEBEB]">
              <h3 className="text-base font-bold text-[#222222]">Create a New Listing</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-[#717171]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
              <div>
                <label className="block font-bold text-[#222222] mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Glass Villa with Private Pool"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#222222] mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your space, special features, and ambiance..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:border-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#222222] mb-1">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:border-black focus:outline-none"
                  >
                    <option value="Flat">Flat</option>
                    <option value="Villa">Villa</option>
                    <option value="Farm stay">Farm stay</option>
                    <option value="Cabin">Cabin</option>
                    <option value="Loft">Loft</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#222222] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:border-black focus:outline-none"
                  >
                    <option value="popular">Popular</option>
                    <option value="farms">Farms</option>
                    <option value="beachfront">Beachfront</option>
                    <option value="cabins">Cabins</option>
                    <option value="luxury">Luxury</option>
                    <option value="iconic_cities">Iconic cities</option>
                    <option value="pools">Amazing pools</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#222222] mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#222222] mb-1">Price per Night (₹)</label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#222222] mb-1">
                  Photo URLs (1 per line - 5 recommended)
                </label>
                <textarea
                  rows={4}
                  required
                  value={photosInput}
                  onChange={(e) => setPhotosInput(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:border-black focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#222222] mb-2">Amenities</label>
                <div className="grid grid-cols-2 gap-2">
                  {allAmenitiesOptions.map((am) => (
                    <label
                      key={am}
                      onClick={() => toggleAmenity(am)}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(am)}
                        readOnly
                        className="rounded"
                      />
                      <span>{am}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#EBEBEB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold hover:border-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="airbnb-btn-gradient text-white font-bold py-2.5 px-6 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Publishing..." : "Publish Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
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
