import React, { useEffect, useState } from "react";
import { Sparkles, HeartHandshake, Flame, Calendar, IndianRupee } from "lucide-react";
import { FESTIVE_LOADING_TIPS } from "../data/celebrationPresets";

interface LoadingStateProps {
  eventType: string;
  city: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ eventType, city }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    `Consulting Vedic Muhurat & Indian celebration traditions for ${city}...`,
    "Balancing category budget allocations in INR with local market benchmarks...",
    "Engineering backward reverse timeline from event date down to Day 0...",
    "Compiling essential vendor deliverables, rates & negotiation queries...",
    "Curating 5 bespoke cultural rituals (Haldi, Sangeet, Pooja & Feasting)...",
  ];

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % FESTIVE_LOADING_TIPS.length);
    }, 3200);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2200);

    return () => {
      clearInterval(tipInterval);
      clearInterval(stepInterval);
    };
  }, [steps.length]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="my-10 bg-white rounded-3xl border border-[#F0E6D8] shadow-xl p-8 sm:p-12 text-center max-w-2xl mx-auto relative overflow-hidden"
    >
      {/* Decorative festive corner flares */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl" />

      {/* Diya / Kalash glowing icon */}
      <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#E05A1B] via-[#F37021] to-[#FFB800] text-white shadow-xl shadow-orange-500/30 mb-6 animate-bounce">
        <Flame className="w-10 h-10 text-amber-200 animate-pulse" />
        <div className="absolute inset-0 rounded-3xl border-2 border-amber-300 animate-ping opacity-30" />
      </div>

      <h3 className="text-2xl font-bold text-[#2E180E] font-serif-indian tracking-tight">
        Orchestrating Your {eventType}
      </h3>
      <p className="text-sm font-medium text-[#7C4825] mt-1">
        Customizing for {city} with authentic Indian customs & INR budgeting
      </p>

      {/* Current step progress */}
      <div className="mt-6 mb-8 max-w-md mx-auto">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-500 mb-2">
          <span>AI Synthesis Progress</span>
          <span>{Math.round(((stepIndex + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="w-full h-2.5 bg-amber-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#E05A1B] to-[#FFB800] transition-all duration-700 ease-out"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-stone-600 font-medium mt-3 italic animate-fade-in min-h-[1.5rem]">
          ✨ {steps[stepIndex]}
        </p>
      </div>

      {/* Rotating cultural celebration trivia */}
      <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#F5E5D3] text-left">
        <div className="flex items-center gap-2 text-xs font-bold text-[#A5470D] uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Indian Celebration Wisdom</span>
        </div>
        <p className="text-xs sm:text-sm text-[#4D2813] font-medium leading-relaxed transition-opacity duration-500">
          "{FESTIVE_LOADING_TIPS[tipIndex]}"
        </p>
      </div>

      <p className="text-[11px] text-stone-400 mt-4">
        Calling Gemini once with strict structured schema. Usually takes 4-8 seconds.
      </p>
    </div>
  );
};
