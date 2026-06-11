import React from "react";
import { Vehicle } from "../types.ts";
import { Plus, Edit, Trash2, Sparkles, Database, Save, ArrowLeftCircle, CheckCircle, RefreshCcw, Loader2 } from "lucide-react";

interface AdminDashboardProps {
  vehicles: Vehicle[];
  onAddVehicle: (car: any) => Promise<any>;
  onEditVehicle: (id: number, car: any) => Promise<any>;
  onDeleteVehicle: (id: number) => Promise<any>;
  token: string | null;
}

export default function AdminDashboard({
  vehicles,
  onAddVehicle,
  onEditVehicle,
  onDeleteVehicle,
  token,
}: AdminDashboardProps) {
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [formBrand, setFormBrand] = React.useState("");
  const [formModel, setFormModel] = React.useState("");
  const [formGeneration, setFormGeneration] = React.useState("");
  const [formProductionYears, setFormProductionYears] = React.useState("");
  const [formTrimLevel, setFormTrimLevel] = React.useState("");
  const [formEngineType, setFormEngineType] = React.useState("");
  const [formEngineSize, setFormEngineSize] = React.useState("");
  const [formHorsepower, setFormHorsepower] = React.useState("");
  const [formTorque, setFormTorque] = React.useState("");
  const [formTransmission, setFormTransmission] = React.useState("");
  const [formDrivetrain, setFormDrivetrain] = React.useState("");
  const [formFuelType, setFormFuelType] = React.useState("");
  const [formWeight, setFormWeight] = React.useState("");
  const [formDimensions, setFormDimensions] = React.useState("");
  const [formFuelCapacity, setFormFuelCapacity] = React.useState("");
  const [formTopSpeed, setFormTopSpeed] = React.useState("");
  const [formZeroToHundred, setFormZeroToHundred] = React.useState("");
  const [formZeroToSixty, setFormZeroToSixty] = React.useState("");
  const [formQuarterMileTime, setFormQuarterMileTime] = React.useState("");
  const [formPowerToWeight, setFormPowerToWeight] = React.useState("");
  const [formFuelConsumption, setFormFuelConsumption] = React.useState("");
  const [formImageUrl, setFormImageUrl] = React.useState("");
  const [formInteriorImageUrl, setFormInteriorImageUrl] = React.useState("");
  const [formExteriorImageUrl, setFormExteriorImageUrl] = React.useState("");
  const [formAngleImageUrl, setFormAngleImageUrl] = React.useState("");
  const [formIsFeatured, setFormIsFeatured] = React.useState(false);

  // Gemini smart research states
  const [gBrand, setGBrand] = React.useState("");
  const [gModel, setGModel] = React.useState("");
  const [gYear, setGYear] = React.useState("");
  const [gLoading, setGLoading] = React.useState(false);
  const [gResult, setGResult] = React.useState<any | null>(null);
  const [gStatusText, setGStatusText] = React.useState("");

  const resetForm = () => {
    setEditingId(null);
    setFormBrand("");
    setFormModel("");
    setFormGeneration("");
    setFormProductionYears("");
    setFormTrimLevel("");
    setFormEngineType("");
    setFormEngineSize("");
    setFormHorsepower("");
    setFormTorque("");
    setFormTransmission("");
    setFormDrivetrain("");
    setFormFuelType("");
    setFormWeight("");
    setFormDimensions("");
    setFormFuelCapacity("");
    setFormTopSpeed("");
    setFormZeroToHundred("");
    setFormZeroToSixty("");
    setFormQuarterMileTime("");
    setFormPowerToWeight("");
    setFormFuelConsumption("");
    setFormImageUrl("");
    setFormInteriorImageUrl("");
    setFormExteriorImageUrl("");
    setFormAngleImageUrl("");
    setFormIsFeatured(false);
  };

  const loadVehicleToForm = (car: Vehicle) => {
    setEditingId(car.id);
    setFormBrand(car.brand || "");
    setFormModel(car.model || "");
    setFormGeneration(car.generation || "");
    setFormProductionYears(car.productionYears || "");
    setFormTrimLevel(car.trimLevel || "");
    setFormEngineType(car.engineType || "");
    setFormEngineSize(car.engineSize || "");
    setFormHorsepower(car.horsepower ? String(car.horsepower) : "");
    setFormTorque(car.torque ? String(car.torque) : "");
    setFormTransmission(car.transmission || "");
    setFormDrivetrain(car.drivetrain || "");
    setFormFuelType(car.fuelType || "");
    setFormWeight(car.weight ? String(car.weight) : "");
    setFormDimensions(car.dimensions || "");
    setFormFuelCapacity(car.fuelCapacity || "");
    setFormTopSpeed(car.topSpeed ? String(car.topSpeed) : "");
    setFormZeroToHundred(car.zeroToHundred || "");
    setFormZeroToSixty(car.zeroToSixty || "");
    setFormQuarterMileTime(car.quarterMileTime || "");
    setFormPowerToWeight(car.powerToWeight || "");
    setFormFuelConsumption(car.fuelConsumption || "");
    setFormImageUrl(car.imageUrl || "");
    setFormInteriorImageUrl(car.interiorImageUrl || "");
    setFormExteriorImageUrl(car.exteriorImageUrl || "");
    setFormAngleImageUrl(car.angleImageUrl || "");
    setFormIsFeatured(car.isFeatured || false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBrand || !formModel) {
      alert("Brand and Model inputs are mandatory!");
      return;
    }

    const payload = {
      brand: formBrand,
      model: formModel,
      generation: formGeneration,
      productionYears: formProductionYears,
      trimLevel: formTrimLevel,
      engineType: formEngineType,
      engineSize: formEngineSize,
      horsepower: formHorsepower ? parseInt(formHorsepower) : null,
      torque: formTorque ? parseInt(formTorque) : null,
      transmission: formTransmission,
      drivetrain: formDrivetrain,
      fuelType: formFuelType,
      weight: formWeight ? parseInt(formWeight) : null,
      dimensions: formDimensions,
      fuelCapacity: formFuelCapacity,
      topSpeed: formTopSpeed ? parseInt(formTopSpeed) : null,
      zeroToHundred: formZeroToHundred,
      zeroToSixty: formZeroToSixty,
      quarterMileTime: formQuarterMileTime,
      powerToWeight: formPowerToWeight,
      fuelConsumption: formFuelConsumption,
      imageUrl: formImageUrl,
      interiorImageUrl: formInteriorImageUrl,
      exteriorImageUrl: formExteriorImageUrl,
      angleImageUrl: formAngleImageUrl,
      isFeatured: formIsFeatured,
    };

    try {
      if (editingId) {
        await onEditVehicle(editingId, payload);
      } else {
        await onAddVehicle(payload);
      }
      resetForm();
    } catch (err: any) {
      alert("Error saving vehicle specification: " + err.message);
    }
  };

  // Smart Gemini Research
  const handleGeminiResearch = async () => {
    if (!gBrand || !gModel) {
      alert("Type a valid Brand and Model first!");
      return;
    }

    setGLoading(true);
    setGResult(null);
    setGStatusText("Spawning Grounded Crawler...");

    const statusUpdates = [
      "Contacting Google Search API for verified documents...",
      "Analyzing factory technical specifications PDFs...",
      "Extracting displacement ratios and torque dimensions...",
      "Confirming top speed records and drag profiles...",
      "Formulating verified JSON data output...",
    ];

    let updateIdx = 0;
    const interval = setInterval(() => {
      if (updateIdx < statusUpdates.length) {
        setGStatusText(statusUpdates[updateIdx]);
        updateIdx++;
      }
    }, 1500);

    try {
      const resp = await fetch("/api/gemini/verify-vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          brand: gBrand,
          model: gModel,
          year: gYear,
        }),
      });

      const data = await resp.json();
      if (resp.ok) {
        setGResult(data.data);
      } else {
        alert("Gemini Research Error: " + data.error);
      }
    } catch (err: any) {
      alert("AI lookups had a network exception: " + err.message);
    } finally {
      clearInterval(interval);
      setGLoading(false);
      setGStatusText("");
    }
  };

  const applyGeminiResultToForm = () => {
    if (!gResult) return;
    setFormBrand(gResult.brand || "");
    setFormModel(gResult.model || "");
    setFormGeneration(gResult.generation || "Official Data Not Available");
    setFormProductionYears(gResult.productionYears || "Official Data Not Available");
    setFormTrimLevel(gResult.trimLevel || "Official Data Not Available");
    setFormEngineType(gResult.engineType || "Official Data Not Available");
    setFormEngineSize(gResult.engineSize || "Official Data Not Available");
    setFormHorsepower(gResult.horsepower ? String(gResult.horsepower) : "");
    setFormTorque(gResult.torque ? String(gResult.torque) : "");
    setFormTransmission(gResult.transmission || "Official Data Not Available");
    setFormDrivetrain(gResult.drivetrain || "AWD");
    setFormFuelType(gResult.fuelType || "Official Data Not Available");
    setFormWeight(gResult.weight ? String(gResult.weight) : "");
    setFormDimensions(gResult.dimensions || "Official Data Not Available");
    setFormFuelCapacity(gResult.fuelCapacity || "Official Data Not Available");
    setFormTopSpeed(gResult.topSpeed ? String(gResult.topSpeed) : "");
    setFormZeroToHundred(gResult.zeroToHundred || "Official Data Not Available");
    setFormZeroToSixty(gResult.zeroToSixty || "Official Data Not Available");
    setFormQuarterMileTime(gResult.quarterMileTime || "Official Data Not Available");
    setFormPowerToWeight(gResult.powerToWeight || "Official Data Not Available");
    setFormFuelConsumption(gResult.fuelConsumption || "Official Data Not Available");
    setFormImageUrl(gResult.imageUrl || "");
    setFormInteriorImageUrl(gResult.interiorImageUrl || "");
    setFormExteriorImageUrl(gResult.exteriorImageUrl || "");
    setFormAngleImageUrl(gResult.angleImageUrl || "");
    setGResult(null); // Clear preview once loaded in form
  };

  return (
    <div className="space-y-10">
      {/* Title */}
      <div className="border-b border-zinc-900 pb-5">
        <h3 className="text-2xl font-black font-display text-white">
          SCSCAR Admin <span className="text-red-600">Dashboard</span>
        </h3>
        <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-wider">
          Add, Edit, and Delete supercar specs with verified grounding verification mechanisms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: Form and AI Integration */}
        <div className="space-y-6">
          {/* Gemini Smart AI Component */}
          <div className="bg-gradient-to-br from-[#120505] to-[#0A0A0A] border border-red-950/45 p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-black/80">
            <div className="absolute top-0 right-0 p-3 opacity-15">
              <Sparkles className="w-20 h-20 text-red-500" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
              <h4 className="text-lg font-black font-display text-white">
                SCSCAR Gemini AI Specifications Grounder
              </h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Enter any vehicle brand and model name. Gemini will run audited search grounding to pull verified laboratory technical specifications directly to pre-fill the form!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="e.g. Aston Martin"
                value={gBrand}
                onChange={(e) => setGBrand(e.target.value)}
                className="bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-2.5 text-xs text-white uppercase placeholder-zinc-650 font-mono"
              />
              <input
                type="text"
                placeholder="e.g. Valkyrie"
                value={gModel}
                onChange={(e) => setGModel(e.target.value)}
                className="bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-650 font-mono"
              />
              <button
                onClick={handleGeminiResearch}
                disabled={gLoading}
                className="bg-gradient-to-r from-red-650 to-red-800 text-white font-mono font-bold text-xs px-4 py-2.5 rounded-xl hover:from-red-500 hover:to-red-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {gLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0 text-red-400" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCcw className="w-4 h-4" />
                    <span>Research Vehicle</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Status or Result */}
            {gLoading && (
              <div className="mt-5 p-4 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-red-500 shrink-0" />
                <span className="text-xs font-mono text-zinc-400 animate-pulse">{gStatusText}</span>
              </div>
            )}

            {gResult && (
              <div className="mt-5 p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                  <div className="flex gap-2 items-center text-xs font-mono uppercase text-green-500">
                    <CheckCircle className="w-4 h-4" /> Specs Extracted!
                  </div>
                  <button
                    onClick={applyGeminiResultToForm}
                    className="px-3.5 py-1.5 bg-green-950/30 text-green-400 hover:bg-green-650 hover:text-white text-[10px] font-bold rounded border border-green-800/40 transition-colors"
                  >
                    Load to Add form
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[10px] text-zinc-400">
                  <div>Model Name: <strong className="text-white">{gResult.brand} {gResult.model}</strong></div>
                  <div>Power output: <strong className="text-white">{gResult.horsepower} HP</strong></div>
                  <div>Top speed: <strong className="text-white">{gResult.topSpeed} km/h</strong></div>
                  <div>0-100 acceleration: <strong className="text-white">{gResult.zeroToHundred}</strong></div>
                  <div>Drive layout: <strong className="text-white">{gResult.drivetrain}</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Core Specification Form */}
          <div className="bg-[#0C0C0C]/40 border border-zinc-900 rounded-2xl p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h4 className="text-lg font-black font-display text-white">
                {editingId ? "Edit Brand Details" : "Add Brand Specifications"}
              </h4>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-xs font-mono text-zinc-500 hover:text-white flex items-center gap-1.5"
                >
                  <ArrowLeftCircle className="w-4 h-4" /> Cancel edit
                </button>
              )}
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {/* Brand */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-550">Brand Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bugatti"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                {/* Model */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-550">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chiron Pur Sport"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Generation */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-550">Generation</label>
                  <input
                    type="text"
                    placeholder="e.g. Generation I (992)"
                    value={formGeneration}
                    onChange={(e) => setFormGeneration(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                {/* ProductionYears */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-550">Production Years</label>
                  <input
                    type="text"
                    placeholder="e.g. 2021-Present"
                    value={formProductionYears}
                    onChange={(e) => setFormProductionYears(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* HP */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-550">Horsepower (HP)</label>
                  <input
                    type="number"
                    placeholder="1500"
                    value={formHorsepower}
                    onChange={(e) => setFormHorsepower(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white font-mono focus:border-red-600 focus:outline-none"
                  />
                </div>

                {/* Torque */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-550">Torque (Nm)</label>
                  <input
                    type="number"
                    placeholder="1600"
                    value={formTorque}
                    onChange={(e) => setFormTorque(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white font-mono focus:border-red-600 focus:outline-none"
                  />
                </div>

                {/* Top Speed */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-550">Top Speed (km/h)</label>
                  <input
                    type="number"
                    placeholder="490"
                    value={formTopSpeed}
                    onChange={(e) => setFormTopSpeed(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white font-mono focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Drivetrain */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-550">Drivetrain</label>
                  <select
                    value={formDrivetrain}
                    onChange={(e) => setFormDrivetrain(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 rounded-xl px-3 py-2 text-xs focus:border-red-600 focus:outline-none animate-fadeIn"
                  >
                    <option value="AWD">AWD</option>
                    <option value="RWD">RWD</option>
                    <option value="FWD">FWD</option>
                  </select>
                </div>

                {/* FuelType */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-550">Propulsion Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Gasoline / Hybrid"
                    value={formFuelType}
                    onChange={(e) => setFormFuelType(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-550">Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="1950"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white font-mono focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Engine size */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-550">Engine Size (Displacement)</label>
                  <input
                    type="text"
                    placeholder="e.g. 4.0 L Twin-Turbo"
                    value={formEngineSize}
                    onChange={(e) => setFormEngineSize(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white focus:border-red-600 focus:outline-none"
                  />
                </div>
                {/* Engine Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-550">Engine Layout Style</label>
                  <input
                    type="text"
                    placeholder="e.g. Twin-turbocharged V8"
                    value={formEngineType}
                    onChange={(e) => setFormEngineType(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* ZeroToHundred */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-550">0-100 km/h (s)</label>
                  <input
                    type="text"
                    placeholder="e.g. 2.4s"
                    value={formZeroToHundred}
                    onChange={(e) => setFormZeroToHundred(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white font-mono focus:border-red-600 focus:outline-none"
                  />
                </div>

                {/* ZeroToSixty */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-550">0-60 mph (s)</label>
                  <input
                    type="text"
                    placeholder="e.g. 2.1s"
                    value={formZeroToSixty}
                    onChange={(e) => setFormZeroToSixty(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white font-mono focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Advanced specifics */}
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Transmission: 7-speed DSG"
                  value={formTransmission}
                  onChange={(e) => setFormTransmission(e.target.value)}
                  className="bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-550 focus:border-red-600 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Dimensions: L x W x H"
                  value={formDimensions}
                  onChange={(e) => setFormDimensions(e.target.value)}
                  className="bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-550 focus:border-red-600 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Power Weight (e.g. 500 HP/t)"
                  value={formPowerToWeight}
                  onChange={(e) => setFormPowerToWeight(e.target.value)}
                  className="bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-550 focus:border-red-600 focus:outline-none"
                />
              </div>

              {/* Image links */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-550">Main Vehicle Image (Unsplash URL)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white font-mono focus:border-red-600 focus:outline-none"
                />
              </div>

              {/* Checkboxes \& Action */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="rounded accent-red-600"
                />
                <label htmlFor="featured-check" className="text-xs text-zinc-300 font-medium">
                  Feature vehicle in main showcase list
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-750 text-white text-xs font-mono font-bold uppercase rounded-xl shadow-lg border border-red-500/20 transition duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{editingId ? "Save verified alterations" : "Publish Specifications to Database"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive vehicles specs registry list */}
        <div className="bg-[#0C0C0C]/40 border border-zinc-900 rounded-2xl p-6 lg:p-8 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-950 pb-3">
            <h4 className="text-lg font-black font-display text-white flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-red-500" />
              <span>Specification Registry ({vehicles.length})</span>
            </h4>
          </div>

          <div className="space-y-3.5 max-h-[750px] overflow-y-auto pr-1">
            {vehicles.map((car) => (
              <div
                key={car.id}
                className="bg-zinc-950 border border-zinc-900/60 hover:border-zinc-800 p-4 rounded-xl flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex gap-3 items-center min-w-0">
                  <div className="w-12 h-12 bg-zinc-900 border border-zinc-850 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={car.imageUrl || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"}
                      className="w-full h-full object-cover"
                      alt={car.model}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">{car.brand}</span>
                    <strong className="text-xs font-black text-white block truncate">{car.model}</strong>
                    <span className="text-[9px] font-mono text-zinc-400 mt-0.5 inline-block">
                      {car.horsepower ? `${car.horsepower} HP` : "N/A HP"} • {car.drivetrain || "GT"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadVehicleToForm(car)}
                    className="p-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-850 rounded-lg transition"
                    title="Load Specifications for alterations"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove specifications record for ${car.brand} ${car.model}?`)) {
                        onDeleteVehicle(car.id);
                      }
                    }}
                    className="p-2 bg-zinc-900 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 border border-zinc-850 hover:border-red-900/30 rounded-lg transition"
                    title="Permanent removal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
