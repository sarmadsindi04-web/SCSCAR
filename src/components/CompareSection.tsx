import React from "react";
import { Vehicle } from "../types.ts";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Trash2, AlertTriangle, ShieldCheck, TrendingUp, BarChart4 } from "lucide-react";

interface CompareSectionProps {
  vehicles: Vehicle[];
  onRemoveVehicle: (id: number) => void;
  onClearAll: () => void;
}

export default function CompareSection({
  vehicles,
  onRemoveVehicle,
  onClearAll,
}: CompareSectionProps) {
  // Parsing acceleration safely
  const parseAcceleration = (accStr: string | undefined | null): number => {
    if (!accStr) return 999;
    const match = accStr.match(/^([0-9.]+)/);
    return match ? parseFloat(match[1]) : 999;
  };

  // Find the winning indices for each category
  const findWinnerIndex = (
    category: "horsepower" | "torque" | "topSpeed" | "weight" | "acceleration"
  ): number[] => {
    if (vehicles.length < 2) return [];
    
    let bestValue = category === "weight" || category === "acceleration" ? 999999 : -999999;
    let winningIndices: number[] = [];

    vehicles.forEach((car, index) => {
      let val = 0;
      if (category === "horsepower") val = car.horsepower || 0;
      else if (category === "torque") val = car.torque || 0;
      else if (category === "topSpeed") val = car.topSpeed || 0;
      else if (category === "weight") val = car.weight || 999999;
      else if (category === "acceleration") val = parseAcceleration(car.zeroToHundred);

      if (val === 0 || val === 999999 || val === 999) return;

      if (category === "weight" || category === "acceleration") {
        if (val < bestValue) {
          bestValue = val;
          winningIndices = [index];
        } else if (val === bestValue) {
          winningIndices.push(index);
        }
      } else {
        if (val > bestValue) {
          bestValue = val;
          winningIndices = [index];
        } else if (val === bestValue) {
          winningIndices.push(index);
        }
      }
    });

    return winningIndices;
  };

  const hpWinners = findWinnerIndex("horsepower");
  const torqueWinners = findWinnerIndex("torque");
  const topSpeedWinners = findWinnerIndex("topSpeed");
  const weightWinners = findWinnerIndex("weight");
  const accWinners = findWinnerIndex("acceleration");

  // Recharts Chart Data formatting
  const chartData = vehicles.map((car) => ({
    name: `${car.brand} ${car.model}`,
    Horsepower: car.horsepower || 0,
    "Top Speed": car.topSpeed || 0,
    "Torque(Nm)": car.torque || 0,
  }));

  if (vehicles.length === 0) {
    return (
      <div className="py-20 text-center max-w-2xl mx-auto px-6 border border-white/10 bg-zinc-950 rounded-none">
        <div className="w-12 h-12 bg-[#FF0000] flex items-center justify-center mx-auto mb-6 text-black transform skew-x-12 shadow-[0_0_15px_rgba(255,0,0,0.3)]">
          <BarChart4 className="w-6 h-6 -skew-x-12 stroke-[2.5px]" />
        </div>
        <h3 className="text-sm font-bold tracking-[0.2em] text-[#FF0000] uppercase italic">Compare Matrix is Empty</h3>
        <p className="text-zinc-400 mt-3 text-xs tracking-wide font-light max-w-md mx-auto leading-relaxed">
          Select and add up to 4 hypercars from our Catalog or Search Database to run automated side-by-side performance calculations and winner highlighting.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Table Title Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-1">
            Performance Compare <span className="text-[#FF0000]">Matrix</span>
          </h3>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
            COMPARING {vehicles.length} OF 4 MAXIMUM HYPERCARS
          </p>
        </div>
        <button
          onClick={onClearAll}
          className="px-5 py-2.5 bg-transparent text-[#FF0000] border border-[#FF0000]/35 hover:bg-[#FF0000] hover:text-black hover:border-[#FF0000] font-mono font-bold text-xs tracking-widest uppercase rounded-none transition duration-200 cursor-pointer"
        >
          Clear Grid
        </button>
      </div>

      {/* Comparison Grid Board */}
      <div className="overflow-x-auto rounded-none border border-white/10 bg-black">
        <table className="w-full border-collapse text-left min-w-[700px]">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-950/80">
              <th className="p-4 text-xs font-mono uppercase text-zinc-500 w-[20%]">Full Specifications</th>
              {vehicles.map((car, idx) => (
                <th key={car.id} className="p-4 w-[20%]">
                  <div className="relative">
                    <button
                      onClick={() => onRemoveVehicle(car.id)}
                      className="absolute right-0 top-0 p-1.5 bg-zinc-900 hover:bg-red-600 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="pr-8">
                      <span className="text-[10px] font-mono text-red-500 block uppercase font-bold">
                        Car {idx + 1}
                      </span>
                      <h4 className="text-sm font-black text-white font-display mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                        {car.brand}
                      </h4>
                      <p className="text-xs text-zinc-400 font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                        {car.model}
                      </p>
                    </div>
                  </div>
                </th>
              ))}
              {/* Fill extra empty columns if less than 4 cars compared */}
              {Array.from({ length: Math.max(0, 4 - vehicles.length) }).map((_, i) => (
                <th key={`empty-${i}`} className="p-4 w-[20%] opacity-20 hidden lg:table-cell">
                  <div className="border border-dashed border-zinc-800 rounded-lg p-5 text-center text-xs font-mono text-zinc-500">
                    Slot Available
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {/* Visual Header Row */}
            <tr>
              <td className="p-4 text-xs font-mono text-zinc-500 bg-zinc-950/20">Vehicle Preview</td>
              {vehicles.map((car) => (
                <td key={car.id} className="p-4">
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-zinc-900">
                    <img
                      src={car.imageUrl || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"}
                      className="w-full h-full object-cover"
                      alt={car.model}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </td>
              ))}
              {Array.from({ length: Math.max(0, 4 - vehicles.length) }).map((_, i) => (
                <td key={`empty-img-${i}`} className="p-4 invisible lg:table-cell"></td>
              ))}
            </tr>

            {/* HORSEPOWER */}
            <tr>
              <td className="p-4 text-xs font-mono text-zinc-500 bg-zinc-950/20">Horsepower Output</td>
              {vehicles.map((car, idx) => {
                const isWinner = hpWinners.includes(idx);
                return (
                  <td
                    key={car.id}
                    className={`p-4 transition-colors ${
                      isWinner ? "bg-red-950/15 border border-red-500/20" : ""
                    }`}
                  >
                    <span className="text-sm font-black font-mono text-white block">
                      {car.horsepower ? `${car.horsepower} HP` : "N/A"}
                    </span>
                    {isWinner && (
                      <span className="inline-flex items-center gap-1.5 text-[8px] bg-red-650 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase mt-1">
                        <TrendingUp className="w-2 h-2" /> Leader
                      </span>
                    )}
                  </td>
                );
              })}
              {Array.from({ length: Math.max(0, 4 - vehicles.length) }).map((_, i) => (
                <td key={`empty-hp-${i}`} className="p-4 hidden lg:table-cell"></td>
              ))}
            </tr>

            {/* TORQUE */}
            <tr>
              <td className="p-4 text-xs font-mono text-zinc-500 bg-zinc-950/20">Torque Intensity (Nm)</td>
              {vehicles.map((car, idx) => {
                const isWinner = torqueWinners.includes(idx);
                return (
                  <td
                    key={car.id}
                    className={`p-4 transition-colors ${
                      isWinner ? "bg-red-950/15 border border-red-500/20" : ""
                    }`}
                  >
                    <span className="text-sm font-black font-mono text-white block">
                      {car.torque ? `${car.torque} Nm` : "N/A"}
                    </span>
                    {isWinner && (
                      <span className="inline-flex items-center gap-1.5 text-[8px] bg-red-650 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase mt-1">
                        <TrendingUp className="w-2 h-2" /> Leader
                      </span>
                    )}
                  </td>
                );
              })}
              {Array.from({ length: Math.max(0, 4 - vehicles.length) }).map((_, i) => (
                <td key={`empty-trq-${i}`} className="p-4 hidden lg:table-cell"></td>
              ))}
            </tr>

            {/* TOP SPEED */}
            <tr>
              <td className="p-4 text-xs font-mono text-zinc-500 bg-zinc-950/20">Top Speed</td>
              {vehicles.map((car, idx) => {
                const isWinner = topSpeedWinners.includes(idx);
                return (
                  <td
                    key={car.id}
                    className={`p-4 transition-colors ${
                      isWinner ? "bg-red-950/15 border border-red-500/20" : ""
                    }`}
                  >
                    <span className="text-sm font-black font-mono text-white block">
                      {car.topSpeed ? `${car.topSpeed} km/h` : "N/A"}
                    </span>
                    {isWinner && (
                      <span className="inline-flex items-center gap-1.5 text-[8px] bg-red-650 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase mt-1">
                        <TrendingUp className="w-2 h-2" /> Leader
                      </span>
                    )}
                  </td>
                );
              })}
              {Array.from({ length: Math.max(0, 4 - vehicles.length) }).map((_, i) => (
                <td key={`empty-spd-${i}`} className="p-4 hidden lg:table-cell"></td>
              ))}
            </tr>

            {/* ACCELERATION */}
            <tr>
              <td className="p-4 text-xs font-mono text-zinc-500 bg-zinc-950/20">0-100 km/h Sprint</td>
              {vehicles.map((car, idx) => {
                const isWinner = accWinners.includes(idx);
                return (
                  <td
                    key={car.id}
                    className={`p-4 transition-colors ${
                      isWinner ? "bg-red-950/15 border border-red-500/20" : ""
                    }`}
                  >
                    <span className="text-sm font-black font-mono text-white block font-semibold">
                      {car.zeroToHundred || "N/A"}
                    </span>
                    {isWinner && (
                      <span className="inline-flex items-center gap-1.5 text-[8px] bg-red-650 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase mt-1">
                        <TrendingUp className="w-2 h-2" /> Fastest
                      </span>
                    )}
                  </td>
                );
              })}
              {Array.from({ length: Math.max(0, 4 - vehicles.length) }).map((_, i) => (
                <td key={`empty-acc-${i}`} className="p-4 hidden lg:table-cell"></td>
              ))}
            </tr>

            {/* WEIGHT */}
            <tr>
              <td className="p-4 text-xs font-mono text-zinc-500 bg-zinc-950/20">Dry Mass (Kg)</td>
              {vehicles.map((car, idx) => {
                const isWinner = weightWinners.includes(idx);
                return (
                  <td
                    key={car.id}
                    className={`p-4 transition-colors ${
                      isWinner ? "bg-red-950/15 border border-red-500/20" : ""
                    }`}
                  >
                    <span className="text-sm font-black font-mono text-white block">
                      {car.weight ? `${car.weight} kg` : "N/A"}
                    </span>
                    {isWinner && (
                      <span className="inline-flex items-center gap-1.5 text-[8px] bg-red-650 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase mt-1">
                        <TrendingUp className="w-2 h-2" /> Lightest
                      </span>
                    )}
                  </td>
                );
              })}
              {Array.from({ length: Math.max(0, 4 - vehicles.length) }).map((_, i) => (
                <td key={`empty-wgt-${i}`} className="p-4 hidden lg:table-cell"></td>
              ))}
            </tr>

            {/* TRANSMISSION */}
            <tr>
              <td className="p-4 text-xs font-mono text-zinc-500 bg-zinc-950/20">Transmission Layout</td>
              {vehicles.map((car) => (
                <td key={car.id} className="p-4 text-xs font-medium text-zinc-300 font-mono">
                  {car.transmission || "N/A"}
                </td>
              ))}
              {Array.from({ length: Math.max(0, 4 - vehicles.length) }).map((_, i) => (
                <td key={`empty-trm-${i}`} className="p-4 hidden lg:table-cell"></td>
              ))}
            </tr>

            {/* DRIVETRAIN */}
            <tr>
              <td className="p-4 text-xs font-mono text-zinc-500 bg-zinc-950/20">Drivetrain Type</td>
              {vehicles.map((car) => (
                <td key={car.id} className="p-4 text-xs font-bold font-mono text-white">
                  {car.drivetrain || "N/A"}
                </td>
              ))}
              {Array.from({ length: Math.max(0, 4 - vehicles.length) }).map((_, i) => (
                <td key={`empty-drv-${i}`} className="p-4 hidden lg:table-cell"></td>
              ))}
            </tr>

            {/* ENGINE DISPLACEMENT */}
            <tr>
              <td className="p-4 text-xs font-mono text-zinc-500 bg-zinc-950/20">Engine Displacement Size</td>
              {vehicles.map((car) => (
                <td key={car.id} className="p-4 text-xs font-medium text-zinc-300 font-mono">
                  {car.engineSize || "N/A"}
                </td>
              ))}
              {Array.from({ length: Math.max(0, 4 - vehicles.length) }).map((_, i) => (
                <td key={`empty-eng-${i}`} className="p-4 hidden lg:table-cell"></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Visual Recharts Section */}
      {vehicles.length >= 2 && (
        <div className="bg-[#0C0C0C] border border-white/10 rounded-none p-6 lg:p-8 space-y-6">
          <div>
            <h4 className="text-sm font-bold tracking-[0.2em] text-[#FF0000] uppercase italic">Metric Comparison Graphs</h4>
            <p className="text-[10px] text-zinc-500 font-mono uppercase mt-1">
              Side-by-side specs visualization analytics scale
            </p>
          </div>

          <div className="h-80 w-full font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#52525b" style={{ fontSize: "9px", fontFamily: "monospace", textTransform: "uppercase" }} />
                <YAxis stroke="#52525b" style={{ fontSize: "9px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0A0A0A",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "0px",
                    color: "#FFFFFF",
                    fontFamily: "monospace",
                    fontSize: "10px",
                  }}
                />
                <Legend iconType="square" wrapperStyle={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }} />
                <Bar dataKey="Horsepower" fill="#FF0000" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Torque(Nm)" fill="#800000" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Top Speed" fill="#FFFFFF" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
