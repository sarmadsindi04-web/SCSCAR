import React from "react";
import { Vehicle } from "../types.ts";
import { Search, Sliders, Heart, Plus, Sparkles, Activity, CheckCircle, ChevronRight } from "lucide-react";

interface AdvancedSearchProps {
  vehicles: Vehicle[];
  onSelectVehicle: (v: Vehicle) => void;
  onAddToCompare: (v: Vehicle) => void;
  compareListIds: number[];
  isLoggedIn: boolean;
  favoritesIds: number[];
  onToggleFavorite: (id: number) => void;
  onApplyFilters: (filters: any) => void;
  brands: string[];
}

export default function AdvancedSearch({
  vehicles,
  onSelectVehicle,
  onAddToCompare,
  compareListIds,
  isLoggedIn,
  favoritesIds,
  onToggleFavorite,
  onApplyFilters,
  brands,
}: AdvancedSearchProps) {
  // Local filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedBrand, setSelectedBrand] = React.useState("");
  const [fuelType, setFuelType] = React.useState("");
  const [drivetrain, setDrivetrain] = React.useState("");
  const [hpMin, setHpMin] = React.useState("");
  const [speedMin, setSpeedMin] = React.useState("");
  const [accMax, setAccMax] = React.useState(""); // max 0-100 sprint time
  const [showFilters, setShowFilters] = React.useState(false);

  const triggerSearch = () => {
    onApplyFilters({
      brand: selectedBrand,
      model: searchQuery,
      fuelType,
      drivetrain,
      hpMin,
      speedMin,
      accMax,
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedBrand("");
    setFuelType("");
    setDrivetrain("");
    setHpMin("");
    setSpeedMin("");
    setAccMax("");
    onApplyFilters({});
  };

  return (
    <div className="space-y-6">
      {/* Search Header Bar */}
      <div className="bg-[#0C0C0C]/80 border border-zinc-900 rounded-2xl p-6 shadow-xl shadow-black/40 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Text Input Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by model or generation name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
              className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-650 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none transition duration-300 font-mono"
            />
          </div>

          {/* Brand Selection dropdown */}
          <div className="w-full md:w-56">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-650 text-zinc-300 rounded-xl py-3 px-4 text-sm focus:outline-none transition"
            >
              <option value="">All Manufacturers</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              showFilters
                ? "bg-red-950/20 border-red-800 text-red-400"
                : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <button
            onClick={triggerSearch}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold text-sm rounded-xl transition cursor-pointer"
          >
            Analyze Specifications
          </button>
        </div>

        {/* Sliding Advanced Filters panel */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-zinc-900 animate-fadeIn">
            {/* Fuel Type */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-500 uppercase">Propulsion</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-red-550"
              >
                <option value="">All Architectures</option>
                <option value="Gasoline">Gasoline IC Engine</option>
                <option value="Plug-in Hybrid">Plug-in Hybrid (PHEV)</option>
                <option value="Electric">Battery Electric (BEV)</option>
              </select>
            </div>

            {/* Drivetrain layout */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-500 uppercase">Drivetrain</label>
              <select
                value={drivetrain}
                onChange={(e) => setDrivetrain(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-red-550"
              >
                <option value="">All Layouts</option>
                <option value="AWD">AWD (AWD)</option>
                <option value="RWD">RWD (Rear Wheel Drive)</option>
                <option value="FWD">FWD (Front Wheel Drive)</option>
              </select>
            </div>

            {/* Min Hp Slider */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-500 uppercase">Min Horsepower ({hpMin || "0"} HP)</label>
              <input
                type="range"
                min="0"
                max="1600"
                step="50"
                value={hpMin || "0"}
                onChange={(e) => setHpMin(e.target.value)}
                className="w-full accent-red-600"
              />
            </div>

            {/* Acceleration 0-100 */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-500 uppercase">0–100 Acceleration (Max)</label>
              <select
                value={accMax}
                onChange={(e) => setAccMax(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-red-550"
              >
                <option value="">Unlimited Sprint</option>
                <option value="2.5">Under 2.5 seconds</option>
                <option value="3.0">Under 3.0 seconds</option>
                <option value="4.0">Under 4.0 seconds</option>
                <option value="5.0">Under 5.0 seconds</option>
              </select>
            </div>

            {/* Speed selection & Actions */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-500 uppercase">Min Speed (km/h)</label>
              <input
                type="number"
                placeholder="e.g. 300"
                value={speedMin}
                onChange={(e) => setSpeedMin(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-650 font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex items-end justify-end gap-2.5">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white border border-transparent hover:bg-zinc-900 rounded-lg transition"
              >
                Reset All Criteria
              </button>
              <button
                onClick={triggerSearch}
                className="px-5 py-2 text-xs font-bold font-mono bg-red-950/20 text-red-400 border border-red-900/40 hover:bg-red-650 hover:text-white rounded-lg transition"
              >
                Apply Advanced Matrix
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Catalog Grid Count Header */}
      <div className="flex justify-between items-center px-2">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Query Results: <span className="text-white font-bold">{vehicles.length}</span> verified supercars found
        </span>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-20 bg-[#0C0C0C]/50 rounded-2xl border border-zinc-900">
          <Activity className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h4 className="text-lg font-bold font-display text-white">No Vehicles Match Criteria</h4>
          <p className="text-xs text-zinc-450 mt-1 max-w-md mx-auto leading-relaxed">
            No verified specification records matched your combination of filters. Try broadening your ranges or checking spelling.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((car) => {
            const isFav = favoritesIds.includes(car.id);
            const inCompare = compareListIds.includes(car.id);

            return (
              <div
                key={car.id}
                className="group relative bg-[#0C0C0C] border border-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:border-red-900/40 transition-all duration-300 select-none flex flex-col justify-between"
              >
                {/* Image panel */}
                <div
                  className="relative aspect-video bg-zinc-950 overflow-hidden cursor-pointer"
                  onClick={() => onSelectVehicle(car)}
                >
                  <img
                    src={car.imageUrl || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"}
                    alt={car.model}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category overlay */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/75 backdrop-blur-md rounded text-[9px] font-mono tracking-widest text-red-500 border border-red-950/40">
                    {car.drivetrain || "GT"}
                  </div>

                  {/* Favorite Toggle button */}
                  {isLoggedIn && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(car.id);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-xl border transition-all duration-300 ${
                        isFav
                          ? "bg-red-600/20 border-red-600 text-red-500 shadow-md"
                          : "bg-black/60 border-zinc-850 text-zinc-400 hover:text-white"
                      } cursor-pointer`}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  )}
                </div>

                {/* Info and Spec Overview */}
                <div className="p-5 space-y-4 cursor-pointer" onClick={() => onSelectVehicle(car)}>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                      {car.brand}
                    </span>
                    <h5 className="text-lg font-black font-display text-white mt-0.5 group-hover:text-red-500 transition-colors">
                      {car.model}
                    </h5>
                    <p className="text-xs font-medium text-zinc-450 font-mono mt-0.5 italic">
                      {car.generation || "Factory Spec"} ({car.productionYears})
                    </p>
                  </div>

                  {/* Micro Specs Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900/50 text-center font-mono text-[10px] text-zinc-400">
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-zinc-600">Power</span>
                      <strong className="text-white text-xs">{car.horsepower || "N/A"} HP</strong>
                    </div>
                    <div className="border-x border-zinc-900">
                      <span className="block text-[8px] uppercase tracking-wider text-zinc-600">Top Speed</span>
                      <strong className="text-white text-xs">{car.topSpeed || "N/A"} km/h</strong>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-zinc-600">0–100</span>
                      <strong className="text-zinc-350">{car.zeroToHundred || "N/A"}</strong>
                    </div>
                  </div>
                </div>

                {/* Actions Bottom panel */}
                <div className="p-5 pt-0 border-t border-zinc-900/30 flex items-center justify-between gap-2.5 mt-auto">
                  <button
                    onClick={() => onSelectVehicle(car)}
                    className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-xs text-zinc-300 hover:text-white font-semibold rounded-xl border border-zinc-850 hover:border-zinc-750 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Specifications</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onAddToCompare(car)}
                    className={`p-2.5 rounded-xl border transition-all duration-300 ${
                      inCompare
                        ? "bg-red-650/40 border-red-600 text-red-500 shadow-lg shadow-red-950/20"
                        : "bg-zinc-950 border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white"
                    } cursor-pointer`}
                    title={inCompare ? "Remove from Comparison Grid" : "Add to Comparison Matrix"}
                  >
                    <Plus className={`w-4 h-4 transition-transform ${inCompare ? "rotate-45" : ""}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
