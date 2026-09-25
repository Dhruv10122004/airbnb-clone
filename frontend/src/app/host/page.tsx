"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { ListingSummary, ListingDetail, Booking, HostStats, User } from "@/types";
import {
  fetchHostStats,
  fetchHostListings,
  fetchHostReservations,
  fetchListingById,
  createHostListing,
  updateHostListing,
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
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Users,
  MapPin,
  Sparkles,
  ArrowRight,
  UserCheck,
} from "lucide-react";

export default function HostDashboardPage() {
  const [stats, setStats] = useState<HostStats | null>(null);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("Flat");
  const [category, setCategory] = useState("popular");
  const [city, setCity] = useState("Noida");
  const [stateName, setStateName] = useState("Uttar Pradesh");
  const [country, setCountry] = useState("India");
  const [address, setAddress] = useState("Expressway, Sector 135");
  const [pricePerNight, setPricePerNight] = useState(6500);
  const [cleaningFee, setCleaningFee] = useState(700);
  const [maxGuests, setMaxGuests] = useState(4);
  const [bedrooms, setBedrooms] = useState(2);
  const [beds, setBeds] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  
  // Photos State: array of URLs or Data-URLs
  const [imagesList, setImagesList] = useState<string[]>([
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
  ]);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Wifi",
    "Kitchen",
    "Air conditioning",
    "Free parking on premises",
  ]);

  const allAmenitiesOptions = [
    "Wifi",
    "Kitchen",
    "Air conditioning",
    "Free parking on premises",
    "Private pool",
    "Dedicated workspace",
    "Hot tub / Jacuzzi",
    "Mountain view",
    "Beach access",
    "TV",
    "Balcony",
    "Washer",
  ];

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

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 4000);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode("create");
    setEditingId(null);
    setTitle("");
    setDescription("");
    setPropertyType("Flat");
    setCategory("popular");
    setCity("Noida");
    setStateName("Uttar Pradesh");
    setCountry("India");
    setAddress("Expressway, Sector 135");
    setPricePerNight(6500);
    setCleaningFee(700);
    setMaxGuests(4);
    setBedrooms(2);
    setBeds(2);
    setBathrooms(2);
    setImagesList([
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
    ]);
    setSelectedAmenities(["Wifi", "Kitchen", "Air conditioning", "Free parking on premises"]);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = async (listingId: string) => {
    try {
      const detail = await fetchListingById(listingId);
      setModalMode("edit");
      setEditingId(listingId);
      setTitle(detail.title || "");
      setDescription(detail.description || "");
      setPropertyType(detail.property_type || "Flat");
      setCategory(detail.category || "popular");
      setCity(detail.city || "");
      setStateName(detail.state || "");
      setCountry(detail.country || "India");
      setAddress(detail.address || "");
      setPricePerNight(detail.price_per_night || 5000);
      setCleaningFee(detail.cleaning_fee || 500);
      setMaxGuests(detail.max_guests || 2);
      setBedrooms(detail.bedrooms || 1);
      setBeds(detail.beds || 1);
      setBathrooms(detail.bathrooms || 1);

      const existingImages = detail.images && detail.images.length > 0
        ? detail.images.map((img) => img.url)
        : ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200"];
      setImagesList(existingImages);

      setSelectedAmenities(detail.amenities || ["Wifi", "Kitchen"]);
      setIsModalOpen(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to load listing details for editing");
    }
  };

  // Delete Listing
  const handleDeleteListing = async (id: string, listingTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${listingTitle}"? This will remove the listing and its calendar availability.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteHostListing(id);
      showToast("Listing deleted successfully.");
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete listing");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setImagesList((prev) => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  // Handle Photo URL Add
  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setImagesList((prev) => [...prev, urlInput.trim()]);
    setUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  // Handle Form Submit (Create or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    if (imagesList.length === 0) {
      alert("Please provide at least 1 photo for your listing.");
      return;
    }

    setSubmitting(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      property_type: propertyType,
      category,
      city: city.trim(),
      state: stateName.trim(),
      country: country.trim(),
      address: address.trim(),
      price_per_night: Number(pricePerNight),
      cleaning_fee: Number(cleaningFee),
      max_guests: Number(maxGuests),
      bedrooms: Number(bedrooms),
      beds: Number(beds),
      bathrooms: Number(bathrooms),
      amenities: selectedAmenities,
      image_urls: imagesList,
      is_guest_favourite: true,
    };

    try {
      if (modalMode === "create") {
        await createHostListing(payload);
        showToast("Listing created and published successfully!");
      } else if (modalMode === "edit" && editingId) {
        await updateHostListing(editingId, payload);
        showToast("Listing updated successfully!");
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save listing");
    } finally {
      setSubmitting(false);
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
        
        {/* Top Header & Host Identity */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EBEBEB]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-[#222222]">Host Dashboard</h1>
              {currentUser?.is_superhost && (
                <span className="text-xs bg-rose-50 text-[#FF385C] border border-rose-200 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Superhost
                </span>
              )}
            </div>
            <p className="text-sm text-[#717171] mt-1 flex items-center gap-2">
              <span>Hosting as <strong className="text-black font-semibold">{currentUser?.full_name || "Host"}</strong> ({currentUser?.email})</span>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="text-xs text-[#FF385C] font-semibold underline hover:text-rose-700 cursor-pointer"
              >
                Switch Profile
              </button>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="py-2.5 px-4 rounded-xl border border-gray-300 bg-white hover:border-black text-xs font-bold text-[#222222] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Switch demo host</span>
            </button>
            <button
              onClick={openCreateModal}
              className="airbnb-btn-gradient text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Create new listing</span>
            </button>
          </div>
        </div>

        {/* Action Toast Alert */}
        {actionToast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{actionToast}</span>
            </div>
            <button
              onClick={() => setActionToast(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

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

        {/* Section 1: Your Owned Listings (Full CRUD) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBEBEB] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#222222]">Your Owned Listings ({listings.length})</h3>
              <p className="text-xs text-[#717171] mt-0.5">Manage, edit details & photos, or remove your properties</p>
            </div>
            <button
              onClick={openCreateModal}
              className="text-xs font-bold text-black hover:text-[#FF385C] flex items-center gap-1 cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add another listing</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-neutral-100 rounded-2xl" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-neutral-50/50 space-y-3">
              <p className="text-base font-bold text-[#222222]">You haven&apos;t created any listings with this profile.</p>
              <p className="text-xs text-[#717171] max-w-sm mx-auto">
                Ready to earn extra income? Publish your first listing now or switch to a demo host profile with pre-seeded listings.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={openCreateModal}
                  className="airbnb-btn-gradient text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-xs"
                >
                  Create Listing
                </button>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="border border-gray-300 bg-white hover:border-black text-xs font-semibold py-2.5 px-4 rounded-xl"
                >
                  Switch Demo Host
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((l) => (
                <div
                  key={l.id}
                  className="border border-[#EBEBEB] rounded-2xl overflow-hidden hover:shadow-md transition flex flex-col justify-between bg-white group"
                >
                  <div>
                    <div className="aspect-[16/10] relative bg-neutral-100 overflow-hidden">
                      <img
                        src={l.cover_image}
                        alt={l.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        {l.property_type}
                      </div>
                      <div className="absolute top-3 right-3 bg-black/70 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        ₹{l.price_per_night.toLocaleString("en-IN")}/night
                      </div>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <h4 className="font-bold text-sm text-[#222222] line-clamp-1">{l.title}</h4>
                      <p className="text-xs text-[#717171] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#717171]" />
                        <span>{l.city}, {l.country}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions: Preview, Edit, Delete */}
                  <div className="p-3 bg-neutral-50 border-t border-[#EBEBEB] flex items-center justify-between text-xs font-semibold">
                    <Link
                      href={`/rooms/${l.id}`}
                      target="_blank"
                      className="text-[#717171] hover:text-black flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-neutral-200/60 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(l.id)}
                        className="text-neutral-800 hover:text-black flex items-center gap-1 py-1 px-2.5 rounded-lg border border-gray-200 hover:border-black bg-white transition cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteListing(l.id, l.title)}
                        disabled={deletingId === l.id}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1 py-1 px-2.5 rounded-lg border border-red-100 hover:border-red-300 bg-red-50/50 transition cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingId === l.id ? "Deleting..." : "Delete"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Incoming Guest Reservations */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBEBEB] shadow-xs space-y-6">
          <div>
            <h3 className="text-xl font-bold text-[#222222]">
              Guest Reservations Received ({reservations.length})
            </h3>
            <p className="text-xs text-[#717171] mt-0.5">
              Confirmed bookings and guest itineraries across all your properties
            </p>
          </div>

          {reservations.length === 0 ? (
            <p className="text-xs text-[#717171] py-6 text-center border border-dashed border-gray-200 rounded-2xl">
              No reservations booked on your properties yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EBEBEB] text-[#717171] uppercase tracking-wider font-bold">
                    <th className="pb-3">Listing</th>
                    <th className="pb-3">Reservation ID</th>
                    <th className="pb-3">Dates</th>
                    <th className="pb-3">Guests</th>
                    <th className="pb-3">Host Payout</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEBEB]">
                  {reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 font-bold text-[#222222]">
                        <Link href={`/rooms/${res.listing_id}`} className="hover:underline">
                          {res.listing?.title}
                        </Link>
                      </td>
                      <td className="py-3.5 font-mono text-[11px] text-[#717171]">
                        HM-{res.id.slice(0, 6).toUpperCase()}
                      </td>
                      <td className="py-3.5 text-[#222222]">
                        {res.check_in} → {res.check_out} ({res.total_nights} nights)
                      </td>
                      <td className="py-3.5">{res.guest_count} guests</td>
                      <td className="py-3.5 font-bold text-emerald-700">
                        ₹{res.total_price.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
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

      {/* CREATE / EDIT LISTING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#EBEBEB] bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-bold text-[#222222]">
                  {modalMode === "create" ? "Create a New Listing" : "Edit Listing Details"}
                </h3>
                <p className="text-xs text-[#717171]">
                  {modalMode === "create" ? "Share your space with travelers worldwide" : "Update information, photos, pricing, and amenities"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-[#717171] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              
              {/* Title & Description */}
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-[#222222] mb-1">Listing Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Glass Villa with Private Pool & Lawn"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:border-black focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#222222] mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your property, architecture, views, and surroundings..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:border-black focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Property Type & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#222222] mb-1">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:border-black focus:outline-none text-xs bg-white"
                  >
                    <option value="Flat">Flat / Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Farm stay">Farm stay</option>
                    <option value="Cabin">Cabin</option>
                    <option value="Loft">Loft</option>
                    <option value="House">House</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#222222] mb-1">Explore Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:border-black focus:outline-none text-xs bg-white"
                  >
                    <option value="popular">Popular</option>
                    <option value="farms">Farms</option>
                    <option value="beachfront">Beachfront</option>
                    <option value="cabins">Cabins</option>
                    <option value="luxury">Luxury</option>
                    <option value="iconic_cities">Iconic cities</option>
                    <option value="pools">Amazing pools</option>
                    <option value="mountains">Top of the world</option>
                  </select>
                </div>
              </div>

              {/* Location (City, State, Country, Address) */}
              <div className="space-y-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                <span className="font-bold text-[#222222] block uppercase tracking-wider text-[11px]">Location Details</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#717171] mb-1 font-semibold">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Noida"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded-xl focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#717171] mb-1 font-semibold">State / Region</label>
                    <input
                      type="text"
                      placeholder="e.g. Uttar Pradesh"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded-xl focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#717171] mb-1 font-semibold">Country</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. India"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded-xl focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#717171] mb-1 font-semibold">Street / Neighborhood Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Expressway Greens, Sector 135"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-xl focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Pricing & Capacity */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-[#222222] mb-1">Price / Night (₹)</label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-xl focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#222222] mb-1">Cleaning Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={cleaningFee}
                    onChange={(e) => setCleaningFee(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-xl focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#222222] mb-1">Max Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-xl focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#222222] mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min={1}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-xl focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Photos Section: URL or File Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#222222] block">
                    Listing Photos ({imagesList.length})
                  </label>
                  <span className="text-[11px] text-[#717171]">First photo is used as cover</span>
                </div>

                {/* Upload or Add URL Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-xl focus:border-black focus:outline-none text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrl}
                      className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-black font-semibold rounded-xl text-xs"
                    >
                      Add URL
                    </button>
                  </div>

                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-2 border border-dashed border-gray-300 hover:border-black rounded-xl text-xs font-semibold text-neutral-700 hover:text-black flex items-center justify-center gap-1.5 transition cursor-pointer bg-neutral-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload photos from device</span>
                    </button>
                  </div>
                </div>

                {/* Thumbnail Preview Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  {imagesList.map((imgUrl, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 bg-neutral-100 group">
                      <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Cover Photo
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center cursor-pointer transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities Checklist */}
              <div>
                <label className="block font-bold text-[#222222] mb-2">Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allAmenitiesOptions.map((am) => (
                    <label
                      key={am}
                      onClick={() => toggleAmenity(am)}
                      className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 hover:border-black cursor-pointer select-none text-xs transition"
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

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#EBEBEB] flex justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl font-semibold hover:border-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="airbnb-btn-gradient text-white font-bold py-2.5 px-6 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : modalMode === "create"
                    ? "Publish Listing"
                    : "Save Changes"}
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
