import React, { useState } from "react";
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  ShieldCheck,
  Printer,
  Copy,
  Check,
  Share2,
  BookmarkCheck,
  Flame,
} from "lucide-react";
import confetti from "canvas-confetti";
import { EventPlan } from "../types/planner";
import { formatINR, formatInIndianWords, formatPrettyDate, getDaysRemaining } from "../utils/formatters";

interface EventSummaryBannerProps {
  plan: EventPlan;
  onSavePlan: () => void;
  isSaved: boolean;
}

export const EventSummaryBanner: React.FC<EventSummaryBannerProps> = ({
  plan,
  onSavePlan,
  isSaved,
}) => {
  const [copied, setCopied] = useState(false);
  const countdown = getDaysRemaining(plan.inputs.date);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#E05A1B", "#FFB800", "#FFD700", "#D9381E", "#388E3C"],
    });
  };

  const handleCopySummary = async () => {
    const text = `🎉 ${plan.eventSummary.title}
📍 ${plan.inputs.city} | 🗓 ${formatPrettyDate(plan.inputs.date)} (${countdown.label})
👥 ${plan.inputs.guestCount} Guests | 💰 Budget: ${formatINR(plan.inputs.budgetINR)} (${formatInIndianWords(plan.inputs.budgetINR)})
Per Guest: ${formatINR(plan.eventSummary.perGuestBudget)} | Contingency Buffer: ${formatINR(plan.eventSummary.contingencyFund)}

Auspicious Blessing: "${plan.eventSummary.auspiciousNote}"

Planned with Utsav - Indian Celebration & Event Planner`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn("Failed to copy", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FFF9F2] to-[#FFF3E3] rounded-3xl border-2 border-amber-200/80 shadow-xl p-6 sm:p-8 md:p-10 mb-10 relative overflow-hidden">
      {/* Decorative floral/festive accents */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-radial from-amber-300/30 via-orange-300/10 to-transparent rounded-full pointer-events-none" />

      {/* Top Auspicious ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-amber-200/60 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-[#8C3A00] text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
            <span>Shubh Muhurat & Cultural Blueprint</span>
          </div>

          {plan.isTightBudget && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/90 text-amber-950 text-xs font-extrabold uppercase tracking-wider border border-amber-300 shadow-2xs">
              <span>⚡ Essentials-First Strategy</span>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={triggerConfetti}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-orange-100 hover:bg-orange-200 text-[#8A3200] border border-orange-200 transition-colors"
            title="Celebrate!"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E05A1B]" />
            <span>Celebrate ✨</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 shadow-2xs transition-colors"
            title="Copy summary to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 shadow-2xs transition-colors"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          <button
            onClick={onSavePlan}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border shadow-2xs transition-all ${
              isSaved
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-[#E05A1B] text-white border-[#E05A1B] hover:bg-orange-600"
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>{isSaved ? "Saved in Library" : "Save Plan"}</span>
          </button>
        </div>
      </div>

      {/* Main Title & Tagline */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#2C160B] font-serif-indian tracking-tight leading-tight">
          {plan.eventSummary.title}
        </h1>
        <p className="text-base sm:text-lg text-[#663A1D] font-medium mt-1">
          {plan.eventSummary.tagline}
        </p>

        {/* Traditional Auspicious Blessing / Advice */}
        {plan.eventSummary.auspiciousNote && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/70 text-[#593014] text-sm leading-relaxed flex items-start gap-3">
            <span className="text-xl shrink-0">🪔</span>
            <div>
              <span className="font-bold text-[#8C3A00]">Auspicious Note: </span>
              <span>{plan.eventSummary.auspiciousNote}</span>
            </div>
          </div>
        )}
      </div>

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Budget */}
        <div className="p-4 rounded-2xl bg-white/95 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 mb-1">
            <span>Total Budget</span>
            <IndianRupee className="w-3.5 h-3.5 text-[#E05A1B]" />
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-[#24130A] truncate">
            {formatINR(plan.inputs.budgetINR)}
          </div>
          <div className="text-xs font-bold text-[#E05A1B] mt-0.5">
            {formatInIndianWords(plan.inputs.budgetINR)}
          </div>
        </div>

        {/* Per-Guest Budget */}
        <div className="p-4 rounded-2xl bg-white/95 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 mb-1">
            <span>Cost Per Guest</span>
            <Users className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-[#24130A]">
            {formatINR(plan.eventSummary.perGuestBudget)}
          </div>
          <div className="text-xs text-stone-500 mt-0.5">
            For {plan.inputs.guestCount} Attendees
          </div>
        </div>

        {/* Contingency Buffer */}
        <div className="p-4 rounded-2xl bg-white/95 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 mb-1">
            <span>Contingency Buffer</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-900">
            {formatINR(plan.eventSummary.contingencyFund)}
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-0.5">
            {Math.round((plan.eventSummary.contingencyFund / plan.inputs.budgetINR) * 100)}% Safety Cushion (5–10% Buffer)
          </div>
        </div>

        {/* Auspicious Date & Countdown */}
        <div className="p-4 rounded-2xl bg-white/95 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 mb-1">
            <span>Date & Location</span>
            <MapPin className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-sm sm:text-base font-bold text-[#24130A] truncate">
            {plan.inputs.city}
          </div>
          <div className="text-xs font-semibold text-amber-800 mt-0.5">
            {countdown.label} • {formatPrettyDate(plan.inputs.date)}
          </div>
        </div>
      </div>
    </div>
  );
};
