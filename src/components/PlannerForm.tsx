import React, { useState } from "react";
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  AlertCircle,
  FileText,
  ChevronRight,
  Flame,
  Check,
  Crown,
  PartyPopper,
  Home,
} from "lucide-react";
import { EventInput } from "../types/planner";
import {
  INDIAN_CITIES,
  EVENT_TYPES,
  BUDGET_SHORTCUTS,
  GUEST_SHORTCUTS,
  SAMPLE_PRESETS,
  EventPreset,
} from "../data/celebrationPresets";
import { formatINR, formatInIndianWords, getDaysRemaining } from "../utils/formatters";
import { checkBudgetReality, BudgetRealityCheckResult } from "../utils/budgetCheck";
import { BudgetRealityModal } from "./BudgetRealityModal";

interface PlannerFormProps {
  onSubmit: (inputs: EventInput) => void;
  isLoading: boolean;
  initialInputs?: EventInput;
}

export const PlannerForm: React.FC<PlannerFormProps> = ({
  onSubmit,
  isLoading,
  initialInputs,
}) => {
  // Tomorrow's date as min
  const todayStr = new Date().toISOString().split("T")[0];
  const defaultFutureDate = new Date();
  defaultFutureDate.setDate(defaultFutureDate.getDate() + 90);
  const defaultDateStr = defaultFutureDate.toISOString().split("T")[0];

  const [eventType, setEventType] = useState<string>(
    initialInputs?.eventType || "Wedding / Grand Shaadi (Multi-Day)"
  );
  const [customEventType, setCustomEventType] = useState<string>("");
  const [date, setDate] = useState<string>(initialInputs?.date || defaultDateStr);
  const [city, setCity] = useState<string>(initialInputs?.city || "Mumbai");
  const [guestCount, setGuestCount] = useState<number>(initialInputs?.guestCount || 250);
  const [budgetINR, setBudgetINR] = useState<number>(initialInputs?.budgetINR || 1200000);
  const [customsNotes, setCustomsNotes] = useState<string>(
    initialInputs?.customsNotes || ""
  );

  // Form error state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Budget Reality Check modal state
  const [isRealityModalOpen, setIsRealityModalOpen] = useState(false);
  const [realityCheckResult, setRealityCheckResult] = useState<BudgetRealityCheckResult | null>(null);

  // Countdown info
  const countdown = getDaysRemaining(date);

  const resolvedEventType = eventType === "Other Celebration" ? customEventType.trim() : eventType;
  const currentReality = checkBudgetReality({
    eventType: resolvedEventType || eventType,
    guestCount,
    budgetINR,
  });

  const handleApplyPreset = (preset: EventPreset) => {
    setEventType(preset.eventType);
    setCity(preset.city);
    setGuestCount(preset.guestCount);
    setBudgetINR(preset.budgetINR);
    setCustomsNotes(preset.customsNotes);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    const activeType = eventType === "Other Celebration" ? customEventType.trim() : eventType;
    if (!activeType) {
      newErrors.eventType = "Please select or enter the celebration type.";
    }

    if (!date) {
      newErrors.date = "Please pick an auspicious event date.";
    } else {
      const selected = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selected.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.date = "Event date must be today or in the future.";
      }
    }

    if (!city || city.trim().length === 0) {
      newErrors.city = "Please specify the Indian city or location.";
    }

    if (!guestCount || guestCount <= 0) {
      newErrors.guestCount = "Guest count must be at least 1 person.";
    } else if (guestCount > 10000) {
      newErrors.guestCount = "Maximum supported guest count is 10,000.";
    }

    if (!budgetINR || budgetINR <= 0) {
      newErrors.budgetINR = "Please specify a budget in INR.";
    } else if (budgetINR < 10000) {
      newErrors.budgetINR = "Minimum celebration budget is ₹10,000.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Budget reality check: If budget per guest is below threshold, show friendly warning first!
    const reality = checkBudgetReality({
      eventType: resolvedEventType,
      guestCount,
      budgetINR,
    });

    if (reality.isTight) {
      setRealityCheckResult(reality);
      setIsRealityModalOpen(true);
      return;
    }

    onSubmit({
      eventType: resolvedEventType,
      date,
      city: city.trim(),
      guestCount,
      budgetINR,
      customsNotes: customsNotes.trim(),
      todayDate: todayStr,
      isTightBudget: false,
    });
  };

  const handleProceedWithTightBudget = () => {
    setIsRealityModalOpen(false);
    onSubmit({
      eventType: resolvedEventType,
      date,
      city: city.trim(),
      guestCount,
      budgetINR,
      customsNotes: customsNotes.trim(),
      todayDate: todayStr,
      isTightBudget: true,
    });
  };

  const handleApplySuggestedBudget = (newBudget: number) => {
    setBudgetINR(newBudget);
    setIsRealityModalOpen(false);
    onSubmit({
      eventType: resolvedEventType,
      date,
      city: city.trim(),
      guestCount,
      budgetINR: newBudget,
      customsNotes: customsNotes.trim(),
      todayDate: todayStr,
      isTightBudget: false,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-[#F0E6D8] shadow-xl shadow-amber-900/5 p-6 sm:p-8 md:p-10 transition-all">
      {/* Form Title & Subtitle */}
      <div className="mb-8 border-b border-[#F7EFE4] pb-6">
        <div className="flex items-center gap-2 text-[#E05A1B] text-xs font-bold tracking-widest uppercase mb-1">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Shubh Aarambh • Plan In One Click</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810] font-serif-indian tracking-tight">
          Craft Your Auspicious Celebration
        </h2>
        <p className="mt-1.5 text-sm sm:text-base text-stone-600">
          Enter your celebration details below. Our Indian event intelligence builds an exact INR budget breakdown, reverse timeline, vendor checklist, and personalized cultural traditions.
        </p>

        {/* Preset chips */}
        <div className="mt-5">
          <p className="text-xs font-semibold text-[#8C5E3C] uppercase tracking-wider mb-2.5">
            Or pick an instant Indian celebration template:
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="group inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-[#FAF5EE] text-[#552E14] hover:bg-[#FBE9D0] hover:text-[#9A3800] border border-[#EEDBCA] transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {p.id.includes("wedding") && <Crown className="w-3.5 h-3.5 text-amber-600" />}
                {p.id.includes("haldi") && <Sparkles className="w-3.5 h-3.5 text-orange-500" />}
                {p.id.includes("ganesh") && <Flame className="w-3.5 h-3.5 text-red-500" />}
                {p.id.includes("birthday") && <PartyPopper className="w-3.5 h-3.5 text-purple-500" />}
                {p.id.includes("griha") && <Home className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{p.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white text-orange-700 font-semibold border border-amber-200">
                  {p.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Event Type */}
          <div className="space-y-2">
            <label
              htmlFor="eventType"
              className="block text-sm font-bold text-[#3B1F0E] flex items-center justify-between"
            >
              <span>Celebration / Event Type <span className="text-red-500">*</span></span>
              <span className="text-xs font-normal text-stone-500">Shaadi, Pooja, Birthday</span>
            </label>
            <div className="relative">
              <select
                id="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className={`w-full px-4 py-3 bg-[#FAF8F5] border ${
                  errors.eventType ? "border-red-500 ring-1 ring-red-500" : "border-[#E5D7C5]"
                } rounded-2xl text-[#2B170B] font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                aria-invalid={!!errors.eventType}
                aria-describedby={errors.eventType ? "eventType-error" : undefined}
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            {eventType === "Other Celebration" && (
              <input
                type="text"
                placeholder="E.g., Thread Ceremony (Upanayanam), College Reunion"
                value={customEventType}
                onChange={(e) => setCustomEventType(e.target.value)}
                className="w-full mt-2 px-4 py-2.5 bg-white border border-[#E5D7C5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            )}
            {errors.eventType && (
              <p id="eventType-error" className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.eventType}
              </p>
            )}
          </div>

          {/* 2. Auspicious Date */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="eventDate"
                className="block text-sm font-bold text-[#3B1F0E] flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4 text-[#E05A1B]" />
                <span>Event Date (Shubh Muhurat) <span className="text-red-500">*</span></span>
              </label>
              {date && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold border border-amber-200">
                  {countdown.label}
                </span>
              )}
            </div>
            <input
              type="date"
              id="eventDate"
              min={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-4 py-3 bg-[#FAF8F5] border ${
                errors.date ? "border-red-500 ring-1 ring-red-500" : "border-[#E5D7C5]"
              } rounded-2xl text-[#2B170B] font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? "eventDate-error" : undefined}
            />
            {date && countdown.days < 90 && !countdown.isPast && (
              <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium mt-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  Under 3 months away ({countdown.days} days). Timeline will be compressed into weekly sprints with urgent tasks flagged.
                </span>
              </div>
            )}
            {errors.date && (
              <p id="eventDate-error" className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.date}
              </p>
            )}
          </div>

          {/* 3. City in India */}
          <div className="space-y-2">
            <label
              htmlFor="eventCity"
              className="block text-sm font-bold text-[#3B1F0E] flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4 text-[#E05A1B]" />
              <span>City / Location in India <span className="text-red-500">*</span></span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="eventCity"
                list="indian-cities-list"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="E.g., Mumbai, Jaipur, Delhi NCR, Pune..."
                className={`w-full px-4 py-3 bg-[#FAF8F5] border ${
                  errors.city ? "border-red-500 ring-1 ring-red-500" : "border-[#E5D7C5]"
                } rounded-2xl text-[#2B170B] font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                aria-invalid={!!errors.city}
                aria-describedby={errors.city ? "eventCity-error" : undefined}
              />
              <datalist id="indian-cities-list">
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            {errors.city && (
              <p id="eventCity-error" className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.city}
              </p>
            )}
          </div>

          {/* 4. Guest Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="guestCount"
                className="block text-sm font-bold text-[#3B1F0E] flex items-center gap-1.5"
              >
                <Users className="w-4 h-4 text-[#E05A1B]" />
                <span>Guest Count <span className="text-red-500">*</span></span>
              </label>
              <span className="text-xs text-stone-500 font-medium">
                {guestCount > 0 ? `${guestCount} attendees` : ""}
              </span>
            </div>
            <input
              type="number"
              id="guestCount"
              min="5"
              max="10000"
              step="5"
              value={guestCount || ""}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              placeholder="E.g., 250"
              className={`w-full px-4 py-3 bg-[#FAF8F5] border ${
                errors.guestCount ? "border-red-500 ring-1 ring-red-500" : "border-[#E5D7C5]"
              } rounded-2xl text-[#2B170B] font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
              aria-invalid={!!errors.guestCount}
              aria-describedby={errors.guestCount ? "guestCount-error" : undefined}
            />
            {/* Quick guest chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {GUEST_SHORTCUTS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGuestCount(g.value)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors border ${
                    guestCount === g.value
                      ? "bg-amber-600 text-white border-amber-600 font-semibold"
                      : "bg-[#FAF5EE] text-[#5A3821] border-[#E9DAC8] hover:bg-amber-100"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            {errors.guestCount && (
              <p id="guestCount-error" className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.guestCount}
              </p>
            )}
          </div>
        </div>

        {/* 5. Budget in INR with Smart Lakhs / Crores Display */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <label
              htmlFor="budgetINR"
              className="block text-sm font-bold text-[#3B1F0E] flex items-center gap-1.5"
            >
              <IndianRupee className="w-4 h-4 text-[#E05A1B]" />
              <span>Total Celebration Budget in INR (₹) <span className="text-red-500">*</span></span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-stone-500">In Indian terms:</span>
              <span className="text-base font-extrabold text-[#9A3800] bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
                {formatInIndianWords(budgetINR)}
              </span>
              {guestCount > 0 && budgetINR > 0 && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                    currentReality.isTight
                      ? "text-amber-950 bg-amber-100 border-amber-300"
                      : "text-emerald-800 bg-emerald-50 border-emerald-200"
                  }`}
                  title={currentReality.isTight ? currentReality.reasonMessage : "Healthy budget per attendee"}
                >
                  {currentReality.isTight ? "⚠️" : "✓"} {formatINR(currentReality.perGuest)}/guest
                </span>
              )}
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#8C5E3C]">
              ₹
            </span>
            <input
              type="number"
              id="budgetINR"
              min="10000"
              step="10000"
              value={budgetINR || ""}
              onChange={(e) => setBudgetINR(Number(e.target.value))}
              placeholder="E.g., 1200000"
              className={`w-full pl-9 pr-4 py-3 bg-[#FAF8F5] border ${
                errors.budgetINR ? "border-red-500 ring-1 ring-red-500" : "border-[#E5D7C5]"
              } rounded-2xl text-[#2B170B] font-bold text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
              aria-invalid={!!errors.budgetINR}
              aria-describedby={errors.budgetINR ? "budgetINR-error" : undefined}
            />
          </div>

          {/* Quick budget chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#8C5E3C] font-medium mr-1">Quick Select:</span>
            {BUDGET_SHORTCUTS.map((b) => (
              <button
                key={b.value}
                type="button"
                onClick={() => setBudgetINR(b.value)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all border ${
                  budgetINR === b.value
                    ? "bg-[#E05A1B] text-white border-[#E05A1B] font-semibold shadow-xs"
                    : "bg-[#FAF5EE] text-[#552E14] border-[#E9DAC8] hover:bg-amber-100"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {currentReality.isTight && guestCount > 0 && budgetINR > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-start gap-2.5 text-xs text-[#52290D]">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950">
                  Desi Market Benchmark Notice:
                </span>{" "}
                At {formatINR(currentReality.perGuest)}/guest, this is below the typical {currentReality.benchmarkLabel}. A recommended minimum of{" "}
                <strong className="text-emerald-900 font-extrabold">{formatINR(currentReality.suggestedMinimumBudget)}</strong> ({formatInIndianWords(currentReality.suggestedMinimumBudget)}) ensures foundational catering and venue costs. You can proceed with economy essentials or adjust.
              </div>
            </div>
          )}

          {errors.budgetINR && (
            <p id="budgetINR-error" className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.budgetINR}
            </p>
          )}
        </div>

        {/* 6. Optional Customs & Traditions Note */}
        <div className="space-y-2 pt-2">
          <label
            htmlFor="customsNotes"
            className="block text-sm font-bold text-[#3B1F0E] flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#E05A1B]" />
              <span>Special Cultural Traditions or Dietary Preferences</span>
            </span>
            <span className="text-xs text-stone-500 font-normal">Optional</span>
          </label>
          <textarea
            id="customsNotes"
            rows={2}
            value={customsNotes}
            onChange={(e) => setCustomsNotes(e.target.value)}
            placeholder="E.g., Pure vegetarian Marwari spread, Haldi floral shower with yellow attire, Bollywood flashmob at Sangeet, Eco-friendly clay Ganesha, Punjabi dhol welcome..."
            className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E5D7C5] rounded-2xl text-[#2B170B] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-stone-400"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#E05A1B] via-[#F37021] to-[#FF8C00] text-white font-bold text-base sm:text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-orange-300"
          >
            <Sparkles className="w-5 h-5 text-amber-200" />
            <span>Generate Celebration & Event Plan</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-center text-xs text-stone-500 mt-2.5">
            1-Click AI Synthesis • Calls Gemini once with strict JSON schema for budget, timeline, vendors & traditions.
          </p>
        </div>
      </form>

      {realityCheckResult && (
        <BudgetRealityModal
          isOpen={isRealityModalOpen}
          onClose={() => setIsRealityModalOpen(false)}
          realityCheck={realityCheckResult}
          currentBudgetINR={budgetINR}
          guestCount={guestCount}
          eventType={resolvedEventType}
          onProceedWithCurrentBudget={handleProceedWithTightBudget}
          onApplySuggestedBudget={handleApplySuggestedBudget}
        />
      )}
    </div>
  );
};
