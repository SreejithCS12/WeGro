"use client";

import { useState } from "react";
import { TrendingUp, Scale, Ruler, Plus, Calendar } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { BodyWeightLog, BodyMeasurementLog, WorkoutSession } from "@/types/database";

interface ProgressViewProps {
  weightLogs: BodyWeightLog[];
  measurementLogs: BodyMeasurementLog[];
  completedSessions: WorkoutSession[];
  onOpenWeightModal: () => void;
  onAddMeasurement: (date: string, measurements: Partial<BodyMeasurementLog>) => void;
}

export function ProgressView({
  weightLogs,
  measurementLogs,
  completedSessions,
  onOpenWeightModal,
  onAddMeasurement,
}: ProgressViewProps) {
  // Sort weight logs ascending for charting
  const sortedWeights = [...weightLogs].sort((a, b) =>
    a.entry_date.localeCompare(b.entry_date)
  );

  const chartData = sortedWeights.map((w) => ({
    date: w.entry_date.slice(5), // MM-DD
    weight: w.weight_kg,
  }));

  const latestWeight = sortedWeights[sortedWeights.length - 1]?.weight_kg || 0;
  const initialWeight = sortedWeights[0]?.weight_kg || latestWeight;
  const delta = Number((latestWeight - initialWeight).toFixed(1));

  // Measurement Modal toggle
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [waist, setWaist] = useState("");
  const [chest, setChest] = useState("");
  const [arms, setArms] = useState("");
  const [hips, setHips] = useState("");
  const [thighs, setThighs] = useState("");

  const latestMeasurement = measurementLogs[0];

  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMeasurement(new Date().toISOString().split("T")[0], {
      waist_cm: parseFloat(waist) || undefined,
      chest_cm: parseFloat(chest) || undefined,
      arms_cm: parseFloat(arms) || undefined,
      hips_cm: parseFloat(hips) || undefined,
      thighs_cm: parseFloat(thighs) || undefined,
    });
    setShowMeasureModal(false);
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Weight Progression Card */}
      <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-4 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Body Weight History
              </h3>
              <p className="text-[11px] text-zinc-400">Recorded measurements</p>
            </div>
          </div>

          <button
            onClick={onOpenWeightModal}
            className="py-1.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-violet-600/30 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Weight</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#18181b] p-3 rounded-xl border border-[#27272a]">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Latest</span>
            <span className="text-lg font-extrabold text-white font-mono">{latestWeight} kg</span>
          </div>
          <div className="bg-[#18181b] p-3 rounded-xl border border-[#27272a]">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Starting</span>
            <span className="text-lg font-extrabold text-zinc-300 font-mono">{initialWeight} kg</span>
          </div>
          <div className="bg-[#18181b] p-3 rounded-xl border border-[#27272a]">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Change</span>
            <span
              className={`text-lg font-extrabold font-mono ${
                delta < 0 ? "text-emerald-400" : delta > 0 ? "text-violet-400" : "text-zinc-300"
              }`}
            >
              {delta > 0 ? `+${delta}` : delta} kg
            </span>
          </div>
        </div>

        {/* Interactive Chart */}
        <div className="w-full h-56 pt-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={10}
                  domain={["dataMin - 1", "dataMax + 1"]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}kg`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#18181b] border border-violet-500/40 p-2 rounded-xl shadow-xl text-xs">
                          <p className="text-zinc-400 text-[10px]">{payload[0].payload.date}</p>
                          <p className="text-white font-mono font-bold">{payload[0].value} kg</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--primary, #8b5cf6)"
                  strokeWidth={3}
                  dot={{ fill: "var(--color-violet-400, #a78bfa)", stroke: "var(--color-violet-600, #7c3aed)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "var(--color-violet-300, #c4b5fd)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500">
              No weight records logged yet.
            </div>
          )}
        </div>
      </div>

      {/* 2-Column Responsive Grid on Tablet/Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Body Measurements Card */}
        <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Ruler className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Body Measurements
                </h3>
                <p className="text-[11px] text-zinc-400">Optional circumference tracking (cm)</p>
              </div>
            </div>

            <button
              onClick={() => setShowMeasureModal(true)}
              className="py-1 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-violet-400 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record</span>
            </button>
          </div>

          {/* Current Measurements Grid */}
          <div className="grid grid-cols-5 gap-2 text-center pt-1">
            <div className="bg-[#18181b] p-2 rounded-xl border border-[#27272a]">
              <span className="text-[10px] text-zinc-400 block">Waist</span>
              <span className="text-xs font-bold text-white font-mono">
                {latestMeasurement?.waist_cm ? `${latestMeasurement.waist_cm} cm` : "—"}
              </span>
            </div>
            <div className="bg-[#18181b] p-2 rounded-xl border border-[#27272a]">
              <span className="text-[10px] text-zinc-400 block">Chest</span>
              <span className="text-xs font-bold text-white font-mono">
                {latestMeasurement?.chest_cm ? `${latestMeasurement.chest_cm} cm` : "—"}
              </span>
            </div>
            <div className="bg-[#18181b] p-2 rounded-xl border border-[#27272a]">
              <span className="text-[10px] text-zinc-400 block">Arms</span>
              <span className="text-xs font-bold text-white font-mono">
                {latestMeasurement?.arms_cm ? `${latestMeasurement.arms_cm} cm` : "—"}
              </span>
            </div>
            <div className="bg-[#18181b] p-2 rounded-xl border border-[#27272a]">
              <span className="text-[10px] text-zinc-400 block">Hips</span>
              <span className="text-xs font-bold text-white font-mono">
                {latestMeasurement?.hips_cm ? `${latestMeasurement.hips_cm} cm` : "—"}
              </span>
            </div>
            <div className="bg-[#18181b] p-2 rounded-xl border border-[#27272a]">
              <span className="text-[10px] text-zinc-400 block">Thighs</span>
              <span className="text-xs font-bold text-white font-mono">
                {latestMeasurement?.thighs_cm ? `${latestMeasurement.thighs_cm} cm` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Workout Consistency Summary */}
        <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
              Workout Consistency
            </h3>
            <p className="text-[11px] text-zinc-400 mb-4">Total sessions completed</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-between">
            <span className="text-xs text-zinc-300 font-medium">Completed workouts:</span>
            <span className="text-lg font-bold font-mono text-violet-400">
              {completedSessions.length} sessions
            </span>
          </div>
        </div>
      </div>

      {/* Measurement Modal */}
      {showMeasureModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-[#27272a] rounded-2xl w-full max-w-sm p-4 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Record Body Measurements (cm)</h3>
            <form onSubmit={handleSaveMeasurement} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={chest}
                    onChange={(e) => setChest(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400">Arms (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={arms}
                    onChange={(e) => setArms(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400">Hips (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hips}
                    onChange={(e) => setHips(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400">Thighs (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={thighs}
                  onChange={(e) => setThighs(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMeasureModal(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs text-white font-bold shadow-md shadow-violet-600/30"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
