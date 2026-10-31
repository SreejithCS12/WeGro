"use client";

import { useState, useEffect } from "react";
import { X, Scale, Plus, Minus } from "lucide-react";
import { formatDateToISO } from "@/lib/utils";

interface RecordWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  latestWeight?: number | null;
  onSaveWeight: (date: string, weightKg: number, notes?: string) => void;
}

export function RecordWeightModal({
  isOpen,
  onClose,
  currentDate,
  latestWeight = 78.5,
  onSaveWeight,
}: RecordWeightModalProps) {
  const [weight, setWeight] = useState<number>(latestWeight || 75.0);
  const [date, setDate] = useState<string>(currentDate || formatDateToISO(new Date()));
  const [notes, setNotes] = useState("");

  // Sync state whenever modal opens or props update
  useEffect(() => {
    if (isOpen) {
      if (typeof latestWeight === "number" && latestWeight > 0) {
        setWeight(latestWeight);
      }
      if (currentDate) {
        setDate(currentDate);
      }
      setNotes("");
    }
  }, [isOpen, latestWeight, currentDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight > 0) {
      onSaveWeight(date, Number(weight.toFixed(2)), notes || undefined);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#141417] border border-[#27272a] rounded-t-3xl sm:rounded-2xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Weight</h3>
              <p className="text-xs text-zinc-400">Track body composition</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Stepper display */}
          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Body Weight (kg)
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setWeight((prev) => Math.max(30, Number((prev - 0.1).toFixed(1))))}
                className="w-10 h-10 rounded-full bg-[#18181b] border border-[#27272a] hover:border-zinc-500 flex items-center justify-center text-zinc-300 active:scale-95 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  className="w-24 text-3xl font-extrabold font-mono text-center text-white bg-transparent outline-none border-b border-violet-500/50 pb-1"
                />
                <span className="text-sm font-semibold text-zinc-400">kg</span>
              </div>

              <button
                type="button"
                onClick={() => setWeight((prev) => Math.min(300, Number((prev + 0.1).toFixed(1))))}
                className="w-10 h-10 rounded-full bg-[#18181b] border border-[#27272a] hover:border-zinc-500 flex items-center justify-center text-zinc-300 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block">Entry Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block">Optional Notes</label>
            <input
              type="text"
              placeholder="e.g. Morning fasting weight"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-violet-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-violet-600/30"
          >
            Save Weight Entry
          </button>
        </form>
      </div>
    </div>
  );
}
