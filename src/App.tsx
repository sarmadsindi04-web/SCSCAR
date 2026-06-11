import React, { useEffect, useState } from "react";
import { User, Vehicle, Favorite } from "./types.ts";
import Navbar from "./components/Navbar.tsx";
import AdvancedSearch from "./components/AdvancedSearch.tsx";
import CompareSection from "./components/CompareSection.tsx";
import AdminDashboard from "./components/AdminDashboard.tsx";
import CarDetailModal from "./components/CarDetailModal.tsx";
import { auth } from "./lib/firebase.ts";
import { onAuthStateChanged } from "firebase/auth";
import { Car, BarChart2, Search, Heart, Sparkles, Star, ArrowRight, Shield, AlertTriangle, ChevronRight } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("home");
  
  // Data States
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [compareList, setCompareList] = useState<Vehicle[]>([]);
  const [recentlyViewedList, setRecentlyViewedList] = useState<any[]>([]);
  
  // Active selected vehicle for detailed Modal
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Filters State
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);

  // Initial home search term
  const [homeSearchTerm, setHomeSearchTerm] = useState("");

  // Clean Login Logic
  const handleLoginSuccess = async (idToken: string, fbUser: any) => {
    setToken(idToken);
    try {
      // Sync user on backend and get full profile details
      const resp = await fetch("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (resp.ok) {
        const fullProfile = await resp.json();
        setUser(fullProfile);
      } else {
        // Fallback profile
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          isAdmin: false,
        });
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setFavorites([]);
  };

  // Listen to Firebase client auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const idToken = await fbUser.getIdToken();
        await handleLoginSuccess(idToken, fbUser);
      } else {
        handleLogout();
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Brands List for drop-downs
  const loadBrands = async () => {
    try {
      const r = await fetch("/api/brands");
      if (r.ok) {
        const data = await r.json();
        setBrands(data);
      }
    } catch (err) {
      console.error("Failed to load manufacturer brands list:", err);
    }
  };

  // Fetch Vehicles based on applied Filters
  const loadVehicles = async (filters: any) => {
    setLoading(true);
    try {
      const qParams = new URLSearchParams();
      Object.keys(filters).forEach((k) => {
        if (filters[k]) qParams.append(k, filters[k]);
      });

      const url = `/api/vehicles?${qParams.toString()}`;
      const r = await fetch(url, {
        ...(token && { headers: { Authorization: `Bearer ${token}` } }),
      });
      if (r.ok) {
        const data = await r.json();
        setVehicles(data);
      }
    } catch (err) {
      console.error("Failed to load vehicles archive:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Featured vehicles
  const loadFeaturedVehicles = async () => {
    try {
      const r = await fetch("/api/vehicles?featured=true&limit=6");
      if (r.ok) {
        const data = await r.json();
        setFeaturedVehicles(data);
      }
    } catch (err) {
      console.error("Failed to load featured vehicles list:", err);
    }
  };

  // Fetch User Favorites from backend
  const loadFavorites = async () => {
    if (!token) return;
    try {
      const r = await fetch("/api/users/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const data = await r.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error("Failed to load user favorites catalog:", err);
    }
  };

  // Fetch User Recently Viewed history
  const loadRecentlyViewed = async () => {
    if (!token) return;
    try {
      const r = await fetch("/api/users/recently-viewed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const data = await r.json();
        setRecentlyViewedList(data);
      }
    } catch (err) {
      console.error("Failed to load viewed history:", err);
    }
  };

  // Run initial state loading on mount
  useEffect(() => {
    loadBrands();
    loadFeaturedVehicles();
  }, []);

  // Sync users favorites and history whenever user/token state changes
  useEffect(() => {
    if (token) {
      loadFavorites();
      loadRecentlyViewed();
    } else {
      setFavorites([]);
    }
  }, [token]);

  // Synchronise Catalog queries whenever filters altered
  useEffect(() => {
    loadVehicles(activeFilters);
  }, [activeFilters, token]);

  const handleApplyFilters = (filters: any) => {
    setActiveFilters(filters);
  };

  // Manage Favorites Toggling
  const handleToggleFavorite = async (vehicleId: number) => {
    if (!token) {
      alert("Sign in required to persist your visual supercar favorites.");
      return;
    }
    try {
      const resp = await fetch(`/api/users/favorites/${vehicleId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        await loadFavorites();
        // Also update details modal favored status if currently open
        if (selectedVehicle?.id === vehicleId) {
          // No-op triggers state reload
        }
      }
    } catch (err) {
      console.error("Failed to toggle favorite status:", err);
    }
  };

  // Manage Comparison Lists
  const handleAddToCompare = (car: Vehicle) => {
    setCompareList((prev) => {
      const exists = prev.some((x) => x.id === car.id);
      if (exists) {
        // Toggle out
        return prev.filter((x) => x.id !== car.id);
      }
      if (prev.length >= 4) {
        alert("The Comparison Matrix houses up to 4 supercars simultaneously. Clear previous items to add a slot!");
        return prev;
      }
      return [...prev, car];
    });
  };

  const handleRemoveCompare = (id: number) => {
    setCompareList((prev) => prev.filter((x) => x.id !== id));
  };

  const handleClearCompareAll = () => {
    setCompareList([]);
  };

  // Admin database mutation triggers
  const handleAdminAddVehicle = async (payLoad: any) => {
    if (!token) return;
    const resp = await fetch("/api/vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payLoad),
    });

    if (resp.ok) {
      await loadVehicles({});
      await loadFeaturedVehicles();
      await loadBrands();
      return await resp.json();
    } else {
      const errorData = await resp.json();
      throw new Error(errorData.error);
    }
  };

  const handleAdminEditVehicle = async (id: number, payLoad: any) => {
    if (!token) return;
    const resp = await fetch(`/api/vehicles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payLoad),
    });

    if (resp.ok) {
      await loadVehicles({});
      await loadFeaturedVehicles();
      await loadBrands();
      return await resp.json();
    } else {
      const errorData = await resp.json();
      throw new Error(errorData.error);
    }
  };

  const handleAdminDeleteVehicle = async (id: number) => {
    if (!token) return;
    const resp = await fetch(`/api/vehicles/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (resp.ok) {
      await loadVehicles({});
      await loadFeaturedVehicles();
      await loadBrands();
      return await resp.json();
    } else {
      const errorData = await resp.json();
      throw new Error(errorData.error);
    }
  };

  // Home Screen Quick Search handler
  const handleHomeSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilters({ model: homeSearchTerm });
    setActiveTab("catalog");
  };

  // Popular Quick Brand Picker utility
  const handleQuickBrandSelect = (brandName: string) => {
    setActiveFilters({ brand: brandName });
    setActiveTab("catalog");
  };

  // Modal Open Tracking Views
  const handleSelectVehicleForDetails = async (car: Vehicle) => {
    setSelectedVehicle(car);
    // Reload recently viewed array
    if (token) {
      setTimeout(() => {
        loadRecentlyViewed();
      }, 800);
    }
  };

  const favoritesIdsArray = favorites.map((f) => f.vehicle.id);
  const compareListIdsArray = compareList.map((c) => c.id);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans select-none">
      {/* Immersive background glowing red matrix spots */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF0000] opacity-[0.035] blur-[150px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FF0000] opacity-[0.035] blur-[120px] -z-10 pointer-events-none"></div>

      {/* Dynamic Header Navbar (holds google logins popups details) */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* Main Panel Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 sm:px-10 py-10 relative z-10">
        {activeTab === "home" && (
          <div className="space-y-16">
            {/* HERO HERO SECTION: Immersive Header Integration */}
            <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-8 w-full border-b border-white/5 pb-10">
              <div className="max-w-2xl text-left">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-mono font-black tracking-widest text-[#FF0000] uppercase bg-[#FF0000]/10 border border-[#FF0000]/20 mb-4 rounded-none">
                  <Sparkles className="w-3 h-3 text-[#FF0000]" /> SYSTEM SPECIFIED
                </span>
                <h1 className="text-5xl sm:text-7xl font-black leading-[0.9] tracking-tighter uppercase mb-2 font-display text-white">
                  The Ultimate<br />
                  <span className="text-[#FF0000]">Automotive</span> Database
                </h1>
                <p className="text-zinc-400 text-sm font-light tracking-wide max-w-md italic border-l-2 border-[#FF0000] pl-4 leading-relaxed">
                  Exacting performance metrics, factory specifications, and comprehensive technical data for every vehicle ever produced.
                </p>
              </div>

              {/* Dynamic search styled with Immersive look */}
              <form onSubmit={handleHomeSearchSubmit} className="bg-white/5 backdrop-blur-xl p-1 rounded-none flex items-center border border-white/10 w-full xl:w-[460px] shrink-0">
                <input
                  type="text"
                  placeholder="SEARCH BRAND, MODEL OR YEAR..."
                  value={homeSearchTerm}
                  onChange={(e) => setHomeSearchTerm(e.target.value)}
                  className="bg-transparent border-none text-xs w-full px-4 h-12 uppercase font-mono tracking-wider placeholder:text-zinc-500 focus:outline-none"
                />
                <button type="submit" className="bg-[#FF0000] h-12 px-6 flex items-center justify-center cursor-pointer hover:bg-red-700 transition duration-200 shrink-0">
                  <Search className="w-4 h-4 text-black stroke-[3px]" />
                </button>
              </form>
            </div>

            {/* POPULAR BRANDS PICKER TRACKS (Brand Matrix Style) */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h4 className="text-xs font-bold tracking-[0.2em] text-[#FF0000] uppercase italic">Brand Matrix</h4>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase mt-1">Direct specifications query vectors</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 border border-white/10 bg-zinc-950 divide-x divide-y sm:divide-y-0 divide-white/5">
                {[
                  { name: "Ferrari", initial: "F", tagline: "Maranello V12" },
                  { name: "Porsche", initial: "P", tagline: "Stuttgart Boxers" },
                  { name: "Bugatti", initial: "B", tagline: "Molsheim W16" },
                  { name: "Lamborghini", initial: "L", tagline: "Sant'Agata V12" },
                  { name: "McLaren", initial: "M", tagline: "Woking Turbos" },
                ].map((item) => (
                  <div
                    key={item.name}
                    onClick={() => handleQuickBrandSelect(item.name)}
                    className="p-8 flex flex-col items-center justify-center hover:bg-white/5 cursor-pointer transition-all duration-300 group text-center min-h-[140px]"
                  >
                    <div className="text-3xl font-black italic text-white group-hover:text-[#FF0000] transition-colors tracking-tighter mb-2">
                      {item.initial}
                    </div>
                    <strong className="text-xs font-black text-white block uppercase tracking-wider">
                      {item.name}
                    </strong>
                    <span className="text-[9px] font-mono text-zinc-500 block uppercase mt-1 tracking-widest leading-none">
                      {item.tagline}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* FEATURED HYPERCARS CARDS GRID */}
            <div className="space-y-6">
              <div className="flex justify-between items-end px-1">
                <div>
                  <h4 className="text-xl font-bold font-display text-white">Featured Hypercars</h4>
                  <p className="text-xs text-zinc-500 font-mono uppercase mt-0.5">Aesthetic power, tested laboratories</p>
                </div>
                <button
                  onClick={() => {
                    setActiveFilters({});
                    setActiveTab("catalog");
                  }}
                  className="text-xs font-mono font-bold text-red-500 hover:text-white flex items-center gap-1.5 transition"
                >
                  <span>Explore database</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredVehicles.map((car) => {
                  const isFav = favoritesIdsArray.includes(car.id);
                  const inCompare = compareListIdsArray.includes(car.id);

                   return (
                    <div
                      key={`feat-${car.id}`}
                      className="group bg-black border border-white/10 hover:border-[#FF0000]/60 hover:shadow-[0_0_30px_rgba(255,0,0,0.1)] transition-all duration-300 flex flex-col justify-between rounded-none"
                    >
                      <div
                        className="relative aspect-video bg-zinc-950 overflow-hidden cursor-pointer rounded-none border-b border-white/5"
                        onClick={() => handleSelectVehicleForDetails(car)}
                      >
                        <img
                          src={car.imageUrl || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"}
                          alt={car.model}
                          className="w-full h-full object-cover transition-transform duration-550 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/85 text-[8px] font-mono text-[#FF0000] border border-white/10 tracking-widest uppercase">
                          {car.drivetrain || "AWD"}
                        </div>
                        {user && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(car.id);
                            }}
                            className={`absolute top-3 right-3 p-1.5 transition ${
                              isFav
                                ? "bg-[#FF0000]/20 border border-[#FF0000] text-[#FF0000]"
                                : "bg-black/85 border border-white/10 text-zinc-400"
                            } cursor-pointer rounded-none`}
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        )}
                      </div>

                      <div className="p-6 space-y-4 cursor-pointer" onClick={() => handleSelectVehicleForDetails(car)}>
                        <div>
                          <span className="text-[9px] font-mono tracking-widest text-[#FF0000] uppercase block">{car.brand}</span>
                          <h5 className="text-lg font-black tracking-tight leading-tight text-white group-hover:text-[#FF0000] transition-colors mt-0.5 uppercase">
                            {car.model}
                          </h5>
                          <span className="text-[10px] text-zinc-500 font-mono mt-1 block italic truncate">
                            {car.generation || "Standard specs"}
                          </span>
                        </div>

                        {/* Visual statistics list strip */}
                        <div className="space-y-2 border-t border-white/5 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Power output</span>
                            <span className="font-mono font-bold text-white text-xs">{car.horsepower || "N/A"} HP</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Top velocity</span>
                            <span className="font-mono font-bold text-white text-xs">{car.topSpeed || "N/A"} km/h</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 pt-0 flex gap-2">
                        <button
                          onClick={() => handleSelectVehicleForDetails(car)}
                          className="flex-1 py-3 bg-white/5 hover:bg-white hover:text-black text-[10px] text-zinc-300 font-bold tracking-widest uppercase transition-all duration-200 border border-white/10 rounded-none cursor-pointer"
                        >
                          Show Specs Sheet
                        </button>
                        <button
                          onClick={() => handleAddToCompare(car)}
                          className={`p-3 transition rounded-none border ${
                            inCompare
                              ? "bg-[#FF0000]/25 border-[#FF0000] text-[#FF0000]"
                              : "bg-[#0A0A0A] border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                          } cursor-pointer`}
                          title="Add to comparison Matrix"
                        >
                          <BarChart2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PLATFORM HISTORIC ACTIVITY TIMELINE / DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#0C0C0C]/40 border border-zinc-900 rounded-3xl p-6 lg:p-8">
              {/* Left detail card */}
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-red-500 uppercase bg-red-950/15 border border-red-900/10 px-2.5 py-1 rounded-full">
                  <Shield className="w-3.5 h-3.5" /> Technical Accuracy Clause
                </span>
                <h4 className="text-xl font-bold font-display text-white">How SCSCAR Assures Data Accuracy</h4>
                <p className="text-xs text-zinc-450 leading-relaxed">
                  Laboratory engine data, chassis dimensions (Length, Width, Height, dry mass weights), displacement metrics (CC ratio), zero-to-sixty times, and top speed values are meticulously harvested from verified factory blueprints. Values lacking verifiable factory sources are flagged under complete non-hallucination policies.
                </p>
              </div>

              {/* Right View Logs (Premium Recently Viewed lists) */}
              <div className="space-y-4">
                <h5 className="text-sm font-mono uppercase text-zinc-400 tracking-wider">
                  {user ? "Your Recently Viewed Vehicles" : "History Trackings"}
                </h5>
                {user ? (
                  recentlyViewedList.length === 0 ? (
                    <p className="text-xs text-zinc-550 font-mono italic">
                      No vehicles viewed in this session yet. Browse the catalog!
                    </p>
                  ) : (
                    <div className="divide-y divide-zinc-900/60 max-h-56 overflow-y-auto">
                      {recentlyViewedList.map((item) => (
                        <div
                          key={`rv-${item.id}`}
                          onClick={() => handleSelectVehicleForDetails(item.vehicle)}
                          className="py-2.5 flex justify-between items-center text-xs hover:bg-zinc-950 px-2 rounded-lg cursor-pointer transition"
                        >
                          <span className="font-semibold text-zinc-300">
                            {item.vehicle.brand} {item.vehicle.model}
                          </span>
                          <span className="text-zinc-500 text-[10px] font-mono">
                            {new Date(item.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-900 text-center space-y-2">
                    <p className="text-xs text-zinc-450 font-mono">
                      Log in via Google button at the header to track your live specs database browsing history in real time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* COMPREHENSIVE CAR DATABASE CATALOG */}
        {activeTab === "catalog" && (
          <AdvancedSearch
            vehicles={vehicles}
            brands={brands}
            onSelectVehicle={handleSelectVehicleForDetails}
            onAddToCompare={handleAddToCompare}
            compareListIds={compareListIdsArray}
            isLoggedIn={!!user}
            favoritesIds={favoritesIdsArray}
            onToggleFavorite={handleToggleFavorite}
            onApplyFilters={handleApplyFilters}
          />
        )}

        {/* SIDE-BY-SIDE MATRIX MODULE */}
        {activeTab === "compare" && (
          <CompareSection
            vehicles={compareList}
            onRemoveVehicle={handleRemoveCompare}
            onClearAll={handleClearCompareAll}
          />
        )}

        {/* LOGGED IN USER FAVORITES SCREEN */}
        {activeTab === "favorites" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black font-display text-white">
                Saved <span className="text-red-600">Favorites</span>
              </h3>
              <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-wider">
                Personalized hypercars list saved into persistent PostgreSQL tables
              </p>
            </div>

            {!user ? (
              <div className="text-center py-20 bg-[#0C0C0C]/50 rounded-2xl border border-zinc-900">
                <Heart className="w-10 h-10 text-red-500/40 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white">Join SCSCAR Premium</h4>
                <p className="text-xs text-zinc-450 mt-1 max-w-sm mx-auto leading-relaxed">
                  Log in safely with Google credentials to gain unlimited access to building personal bookmarks and saving matrices permanently.
                </p>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-20 bg-[#0C0C0C]/50 rounded-2xl border border-zinc-900">
                <Heart className="w-10 h-10 text-red-500/40 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white">No Bookmarks Created</h4>
                <p className="text-xs text-zinc-450 mt-1 max-w-sm mx-auto">
                  Click the heart icon on any hypercar in the Car Database to bookmark listings.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                {favorites.map((fav) => (
                  <div
                    key={`fav-card-${fav.id}`}
                    className="group bg-[#0C0C0C] border border-zinc-900 hover:border-red-900/30 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
                  >
                    <div
                      className="relative aspect-video bg-zinc-950 overflow-hidden cursor-pointer"
                      onClick={() => handleSelectVehicleForDetails(fav.vehicle)}
                    >
                      <img
                        src={fav.vehicle.imageUrl || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"}
                        alt={fav.vehicle.model}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(fav.vehicle.id);
                        }}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-650/25 border border-red-600 text-red-500 cursor-pointer"
                      >
                        <Heart className="w-4.5 h-4.5 fill-current" />
                      </button>
                    </div>

                    <div className="p-5 space-y-3 cursor-pointer" onClick={() => handleSelectVehicleForDetails(fav.vehicle)}>
                      <div>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">{fav.vehicle.brand}</span>
                        <h5 className="text-base font-black font-display text-white group-hover:text-red-500 transition-colors">
                          {fav.vehicle.model}
                        </h5>
                        <p className="text-xs text-zinc-450 font-mono mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                          {fav.vehicle.generation || "Factory Spec"}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        onClick={() => handleSelectVehicleForDetails(fav.vehicle)}
                        className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-xs text-zinc-350 text-center rounded-xl font-mono uppercase font-bold transition"
                      >
                        Load specs details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADMINISTRATIVE PORTAL CONTROL CENTER */}
        {activeTab === "admin" && user?.isAdmin && (
          <AdminDashboard
            vehicles={vehicles}
            token={token}
            onAddVehicle={handleAdminAddVehicle}
            onEditVehicle={handleAdminEditVehicle}
            onDeleteVehicle={handleAdminDeleteVehicle}
          />
        )}
      </main>

      {/* Dynamic Immersive Details Modal */}
      {selectedVehicle && (
        <CarDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          isFavorited={favoritesIdsArray.includes(selectedVehicle.id)}
          onToggleFavorite={() => handleToggleFavorite(selectedVehicle.id)}
          onAddToCompare={() => handleAddToCompare(selectedVehicle)}
          isInCompare={compareListIdsArray.includes(selectedVehicle.id)}
          isLoggedIn={!!user}
        />
      )}

      {/* Premium Dark Theme Footer */}
      <footer className="border-t border-white/5 bg-zinc-950/80 py-12 px-6 text-center text-[10px] text-zinc-500 font-mono uppercase tracking-[0.15em] mt-24 space-y-3 pb-24 lg:pb-12">
        <p className="text-[#FF0000] font-bold">
          SCSCAR ULTIMATE DATABASE PANEL
        </p>
        <p className="text-zinc-500 leading-relaxed max-w-lg mx-auto">
          COMPREHENSIVE PERFORMANCE VECTORS AND REGISTERED FACTORY TECHNICAL SPECIFICATIONS. GROUNDED IN REAL-TIME MANUFACTURER RECORDS.
        </p>
        <div className="w-8 h-px bg-white/10 mx-auto my-2"></div>
        <p className="text-[9px] text-zinc-600">
          © {new Date().getFullYear()} SCSCAR GLOBAL SPECIFICATION REGISTER. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
}
