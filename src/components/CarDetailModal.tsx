import React from "react";
import { Vehicle } from "../types.ts";
import { X, Heart, ShieldAlert, Maximize2, Gauge, Flame, Zap, HelpCircle } from "lucide-react";

interface CarDetailModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onAddToCompare: () => void;
  isInCompare: boolean;
  isLoggedIn: boolean;
}

export default function CarDetailModal({
  vehicle,
  onClose,
  isFavorited,
  onToggleFavorite,
  onAddToCompare,
  isInCompare,
  isLoggedIn,
}: CarDetailModalProps) {
  const [activeImageTab, setActiveImageTab] = React.useState<"main" | "interior" | "exterior" | "angle">("main");
  const [fullscreenImage, setFullscreenImage] = React.useState<string | null>(null);

  const getActiveImage = () => {
    switch (activeImageTab) {
      case "interior":
        return vehicle.interiorImageUrl || vehicle.imageUrl;
      case "exterior":
        return vehicle.exteriorImageUrl || vehicle.imageUrl;
      case "angle":
        return vehicle.angleImageUrl || vehicle.imageUrl;
      default:
        return vehicle.imageUrl;
    }
  };

  const currentImage = getActiveImage();

  const renderSpecRow = (label: string, value: string | number | null | undefined, icon?: React.ReactNode) => {
    const isUnknown = value === null || value === undefined || value === "" || value === "N/A" || String(value).toLowerCase().includes("not available");
    const displayValue = isUnknown ? "Official Data Not Available" : value;

    return (
      <div className="flex justify-between items-center py-3 border-b border-zinc-900 text-sm">
        <span className="text-zinc-400 font-medium flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span className={`font-semibold ${isUnknown ? "text-red-500/80 font-mono text-xs italic" : "text-white font-mono"}`}>
          {displayValue}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#0A0A0A] w-full max-w-5xl rounded-2xl border border-red-950/40 max-h-[90vh] overflow-y-auto shadow-2xl shadow-black">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-md p-6 border-b border-zinc-900 flex justify-between items-center">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-red-500">
              {vehicle.generation || "Verified Specification Sheet"}
            </span>
            <h2 className="text-3xl font-black font-display text-white mt-1">
              {vehicle.brand} <span className="text-red-600">{vehicle.model}</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <button
                onClick={onToggleFavorite}
                className={`p-2.5 rounded-xl border transition-all duration-300 ${
                  isFavorited
                    ? "bg-red-600/10 border-red-600 text-red-500"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                }`}
                title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>
            )}
            <button
              onClick={onAddToCompare}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-300 ${
                isInCompare
                  ? "bg-red-600 text-white border-red-500"
                  : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {isInCompare ? "Comparing vehicle" : "Add to Comparison"}
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Gallery */}
          <div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-zinc-900 group">
              <img
                src={currentImage || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setFullscreenImage(currentImage || null)}
                className="absolute right-3 bottom-3 p-2 bg-black/70 hover:bg-black text-white rounded-lg transition-colors cursor-pointer"
                title="Fullscreen spec viewer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Gallery Tabs */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[
                { id: "main", label: "Exterior" },
                { id: "interior", label: "Interior" },
                { id: "exterior", label: "Secondary" },
                { id: "angle", label: "Angle Point" },
              ].map((tab) => {
                const isSelected = activeImageTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveImageTab(tab.id as any)}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      isSelected
                        ? "bg-red-950/30 border-red-600 text-red-500"
                        : "bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Core Metrics Bento */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-center flex flex-col justify-center min-h-[90px]">
                <Flame className="w-5 h-5 text-red-500 mx-auto mb-1.5" />
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Horsepower</span>
                <span className="text-lg font-black font-mono text-white mt-0.5">
                  {vehicle.horsepower ? `${vehicle.horsepower} HP` : "N/A"}
                </span>
              </div>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-center flex flex-col justify-center min-h-[90px]">
                <Gauge className="w-5 h-5 text-red-500 mx-auto mb-1.5" />
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Top Speed</span>
                <span className="text-lg font-black font-mono text-white mt-0.5">
                  {vehicle.topSpeed ? `${vehicle.topSpeed} km/h` : "N/A"}
                </span>
              </div>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-center flex flex-col justify-center min-h-[90px]">
                <Zap className="w-5 h-5 text-red-500 mx-auto mb-1.5" />
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">0-100 km/h</span>
                <span className="text-lg font-black font-mono text-white mt-0.5">
                  {vehicle.zeroToHundred || "N/A"}
                </span>
              </div>
            </div>

            <div className="mt-5 p-4 bg-zinc-900/30 rounded-xl border border-red-950/25 flex gap-3 text-xs text-zinc-400">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
              <span>
                Specifications are pulled exclusively from audited manufacturer registries and factory manuals. Missing values indicate the factory has not released verified laboratory details for this metric.
              </span>
            </div>
          </div>

          {/* Deep Specifications */}
          <div className="bg-zinc-950/60 p-6 rounded-2xl border border-zinc-905 flex flex-col gap-1 overflow-y-auto max-h-[550px]">
            <h3 className="text-lg font-bold font-display text-white border-b border-zinc-900 pb-3 mb-2">
              Performance & Drivetrain Specifications
            </h3>
            {renderSpecRow("Transmission Gear Unit", vehicle.transmission)}
            {renderSpecRow("Drivetrain Layout", vehicle.drivetrain)}
            {renderSpecRow("Fueling Architecture", vehicle.fuelType)}
            {renderSpecRow("Engine Output Type", vehicle.engineType)}
            {renderSpecRow("Displacement Volume", vehicle.engineSize)}
            {renderSpecRow("Torque (Nm Metric)", vehicle.torque ? `${vehicle.torque} Nm` : null)}
            {renderSpecRow("Power-to-Weight Ratio", vehicle.powerToWeight)}
            {renderSpecRow("Fuel Capacity / Battery", vehicle.fuelCapacity)}
            {renderSpecRow("Fuel Consumption Ratio", vehicle.fuelConsumption)}

            <h3 className="text-lg font-bold font-display text-white border-b border-zinc-900 pb-3 mt-6 mb-2">
              Chassis & Acceleration Performance
            </h3>
            {renderSpecRow("Chassis Weight (Kg)", vehicle.weight ? `${vehicle.weight} kg` : null)}
            {renderSpecRow("Dimensions (L x W x H)", vehicle.dimensions)}
            {renderSpecRow("Production Lifespan Yr", vehicle.productionYears)}
            {renderSpecRow("Trim Package Level", vehicle.trimLevel)}
            {renderSpecRow("0-60 mph Sprint", vehicle.zeroToSixty)}
            {renderSpecRow("Quarter Mile Time (s)", vehicle.quarterMileTime)}
          </div>
        </div>
      </div>

      {/* Full-screen Photo Overlay */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 p-4 cursor-zoom-out" onClick={() => setFullscreenImage(null)}>
          <button className="absolute top-6 right-6 p-3 bg-zinc-900 text-white rounded-full hover:bg-zinc-800">
            <X className="w-6 h-6" />
          </button>
          <img
            src={fullscreenImage}
            alt="Full screen detail"
            className="max-w-full max-h-full object-contain rounded-lg"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
}
