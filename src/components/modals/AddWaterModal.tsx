"use client";

import { useState } from "react";
import { X, Droplets, Plus, Trash2 } from "lucide-react";
import { WaterLog } from "@/types/database";

interface AddWaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  waterLogs: WaterLog[];
  onAddWater: (amountMl: number) => void;
  onDeleteWater: (id: string) => void;
}

export function AddWaterModal({
  isOpen,
  onClose,
  waterLogs,
  onAddWater,
  onDeleteWater,
}: AddWaterModalProps) {
  const [customMl, setCustomMl] = useState("");

  if (!isOpen) return null;

  const total = waterLogs.reduce((acc, w) => acc + w.amount_ml, 0);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ml = parseInt(customMl);
    if (ml > 0) {
      onAddWater(ml);
      setCustomMl("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#141417] border border-[#27272a] rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Water Intake</h3>
              <p className="text-xs text-zinc-400">Total today: {total.toLocaleString()} ml</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add Buttons */}
        <div className="p-4 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
              Quick Add
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Glass (150 ml)", amount: 150 },
                { label: "Cup (250 ml)", amount: 250 },
                { label: "Bottle (500 ml)", amount: 500 },
                { label: "Large Bottle (1000 ml)", amount: 1000 },
              ].map((opt) => (
                <button
                  key={opt.amount}
                  onClick={() => onAddWater(opt.amount)}
                  className="py-2.5 px-3 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-sky-500/60 hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-between text-xs font-semibold text-zinc-200"
                >
                  <span>{opt.label}</span>
                  <Plus className="w-4 h-4 text-sky-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom ml form */}
          <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-[#27272a]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
              Custom Amount (ml)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="e.g. 350"
                value={customMl}
                onChange={(e) => setCustomMl(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#18181b] border border-[#27272a] focus:border-sky-500 rounded-xl text-xs text-white outline-none font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-md shadow-sky-600/30"
              >
                Log Intake
              </button>
            </div>
          </form>

          {/* Today's Log History */}
          <div className="pt-2 border-t border-[#27272a]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
              Logged Entries Today ({waterLogs.length})
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {waterLogs.length > 0 ? (
                waterLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#18181b] border border-[#27272a]/50 text-xs"
                  >
                    <span className="font-mono font-bold text-sky-300">+{log.amount_ml} ml</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500">{log.logged_at}</span>
                      <button
                        onClick={() => onDeleteWater(log.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-zinc-500 py-2">No water logged today yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
