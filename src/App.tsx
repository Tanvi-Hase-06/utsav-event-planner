import React, { useState, useEffect } from "react";
import {
  Sparkles,
  AlertCircle,
  RotateCcw,
  IndianRupee,
  Clock,
  Users,
  Compass,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import { Header } from "./components/Header";
import { PlannerForm } from "./components/PlannerForm";
import { LoadingState } from "./components/LoadingState";
import { EventSummaryBanner } from "./components/EventSummaryBanner";
import { BudgetSection } from "./components/BudgetSection";
import { ReverseTimelineSection } from "./components/ReverseTimelineSection";
import { VendorChecklistSection } from "./components/VendorChecklistSection";
import { TraditionsSection } from "./components/TraditionsSection";
import { CulturalTipsSection } from "./components/CulturalTipsSection";
import { SavedPlansModal } from "./components/SavedPlansModal";
import { EventInput, EventPlan, TimelineTask } from "./types/planner";
import {
  generateCacheKey,
  loadSavedPlans,
  savePlanToStorage,
  loadActivePlan,
  clearActivePlan,
} from "./utils/formatters";

export default function App() {
  const [activePlan, setActivePlan] = useState<EventPlan | null>(null);
  const [lastInputs, setLastInputs] = useState<EventInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavedPlansOpen, setIsSavedPlansOpen] = useState(false);
  const [savedPlans, setSavedPlans] = useState<EventPlan[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Load initial saved plans and active plan from localStorage on mount
  useEffect(() => {
    const loadedSaved = loadSavedPlans();
    setSavedPlans(loadedSaved);

    const active = loadActivePlan();
    if (active) {
      setActivePlan(active);
      setLastInputs(active.inputs);
    }
  }, []);

  // Update active plan in storage whenever it changes (checklist items, etc.)
  const handleUpdatePlan = (updated: EventPlan) => {
    setActivePlan(updated);
    savePlanToStorage(updated);
    // Also update savedPlans list state
    setSavedPlans(loadSavedPlans());
  };

  const handleFormSubmit = async (inputs: EventInput) => {
    setLastInputs(inputs);
    setErrorMessage(null);

    // 1. Check local cache first
    const cacheKey = generateCacheKey(inputs);
    const cachedPlanJson = localStorage.getItem(cacheKey);

    if (cachedPlanJson) {
      try {
        const cachedPlan: EventPlan = JSON.parse(cachedPlanJson);
        setActivePlan(cachedPlan);
        savePlanToStorage(cachedPlan);
        setSavedPlans(loadSavedPlans());
        return;
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }

    // 2. Call Gemini API endpoint on server
    setIsLoading(true);

    try {
      const response = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const generatedData = await response.json();

      const newPlan: EventPlan = {
        id: `utsav_${Date.now()}`,
        generatedAt: new Date().toISOString(),
        inputs,
        daysUntilEvent: generatedData.daysUntilEvent,
        todayDate: generatedData.todayDate || inputs.todayDate,
        isTimelineCompressed: generatedData.isTimelineCompressed,
        isTightBudget: generatedData.isTightBudget || inputs.isTightBudget,
        eventSummary: generatedData.eventSummary,
        budgetBreakdown: generatedData.budgetBreakdown,
        reverseTimeline: generatedData.reverseTimeline,
        vendorChecklist: generatedData.vendorChecklist,
        personalizedTraditions: generatedData.personalizedTraditions,
        culturalTipsAndAdvice: generatedData.culturalTipsAndAdvice || [],
      };

      // Cache locally
      localStorage.setItem(cacheKey, JSON.stringify(newPlan));
      handleUpdatePlan(newPlan);
    } catch (err: any) {
      console.error("Plan generation failed:", err);
      setErrorMessage(
        err.message ||
          "Could not generate celebration plan. Please verify the date and connection, then try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle timeline task completed
  const handleToggleTask = (phaseId: string, taskId: string) => {
    if (!activePlan) return;
    const updatedPhases = activePlan.reverseTimeline.map((phase) => {
      if (phase.phaseId !== phaseId) return phase;
      return {
        ...phase,
        tasks: phase.tasks.map((task) =>
          task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
        ),
      };
    });

    handleUpdatePlan({
      ...activePlan,
      reverseTimeline: updatedPhases,
    });
  };

  // Add custom task to phase
  const handleAddTask = (phaseId: string, task: TimelineTask) => {
    if (!activePlan) return;
    const updatedPhases = activePlan.reverseTimeline.map((phase) => {
      if (phase.phaseId !== phaseId) return phase;
      return {
        ...phase,
        tasks: [...phase.tasks, task],
      };
    });

    handleUpdatePlan({
      ...activePlan,
      reverseTimeline: updatedPhases,
    });
  };

  // Toggle vendor booked status
  const handleToggleVendorBooked = (vendorId: string) => {
    if (!activePlan) return;
    const updatedVendors = activePlan.vendorChecklist.map((v) =>
      v.id === vendorId ? { ...v, isBooked: !v.isBooked } : v
    );

    handleUpdatePlan({
      ...activePlan,
      vendorChecklist: updatedVendors,
    });
  };

  // Update vendor notes and contact info
  const handleUpdateVendorNotes = (vendorId: string, notes: string, vendorName?: string) => {
    if (!activePlan) return;
    const updatedVendors = activePlan.vendorChecklist.map((v) =>
      v.id === vendorId ? { ...v, notes, vendorName: vendorName || v.vendorName } : v
    );

    handleUpdatePlan({
      ...activePlan,
      vendorChecklist: updatedVendors,
    });
  };

  // Toggle favorite tradition
  const handleToggleFavoriteTradition = (traditionId: string) => {
    if (!activePlan) return;
    const updatedTraditions = activePlan.personalizedTraditions.map((t) =>
      t.id === traditionId ? { ...t, isFavorited: !t.isFavorited } : t
    );

    handleUpdatePlan({
      ...activePlan,
      personalizedTraditions: updatedTraditions,
    });
  };

  // Reset/Start new plan
  const handleReset = () => {
    clearActivePlan();
    setActivePlan(null);
    setErrorMessage(null);
  };

  // Delete saved plan
  const handleDeleteSavedPlan = (planId: string) => {
    const updated = savedPlans.filter((p) => p.id !== planId);
    setSavedPlans(updated);
    localStorage.setItem("utsav_saved_plans_v1", JSON.stringify(updated));
    if (activePlan?.id === planId) {
      clearActivePlan();
      setActivePlan(null);
    }
  };

  const isCurrentlySaved = !!(
    activePlan && savedPlans.some((p) => p.id === activePlan.id)
  );

  return (
    <div className="min-h-screen flex flex-col bg-festive-pattern">
      <Header
        savedPlansCount={savedPlans.length}
        onOpenSavedPlans={() => setIsSavedPlansOpen(true)}
        onResetPlan={handleReset}
        hasActivePlan={!!activePlan}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* If Error: Friendly Error Alert */}
        {errorMessage && (
          <div className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Could not complete planning synthesis</h4>
                <p className="text-xs sm:text-sm text-red-700 mt-1 leading-relaxed">
                  {errorMessage}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => lastInputs && handleFormSubmit(lastInputs)}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-2xs"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && lastInputs && (
          <LoadingState eventType={lastInputs.eventType} city={lastInputs.city} />
        )}

        {/* Active plan view */}
        {!isLoading && activePlan && (
          <div className="space-y-10 animate-fade-in">
            {/* Banner with Auspicious Note & Metrics */}
            <EventSummaryBanner
              plan={activePlan}
              onSavePlan={() => handleUpdatePlan(activePlan)}
              isSaved={isCurrentlySaved}
            />

            {/* Quick Section Navigation Bar */}
            <div className="sticky top-20 z-20 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-[#EEDBCA] shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none no-print">
              {[
                { id: "all", label: "Complete Blueprint", icon: Layers },
                { id: "budget", label: "INR Budget Split", icon: IndianRupee },
                { id: "timeline", label: "Reverse Timeline", icon: Clock },
                { id: "vendors", label: "Vendor Checklist", icon: Users },
                { id: "traditions", label: "5 Vedic Traditions", icon: Flame },
                { id: "advice", label: "City & Cultural Tips", icon: Compass },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all shrink-0 ${
                      isSelected
                        ? "bg-[#E05A1B] text-white shadow-xs"
                        : "text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Section 1: Budget */}
            {(activeTab === "all" || activeTab === "budget") && (
              <BudgetSection
                items={activePlan.budgetBreakdown}
                totalBudgetINR={activePlan.inputs.budgetINR}
                isTightBudget={activePlan.isTightBudget}
              />
            )}

            {/* Section 2: Reverse Timeline */}
            {(activeTab === "all" || activeTab === "timeline") && (
              <ReverseTimelineSection
                phases={activePlan.reverseTimeline}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                eventDate={activePlan.inputs.date}
                todayDate={activePlan.todayDate || activePlan.inputs.todayDate}
                isTimelineCompressed={activePlan.isTimelineCompressed}
                daysUntilEvent={activePlan.daysUntilEvent}
              />
            )}

            {/* Section 3: Vendor Checklist */}
            {(activeTab === "all" || activeTab === "vendors") && (
              <VendorChecklistSection
                vendors={activePlan.vendorChecklist}
                onToggleBooked={handleToggleVendorBooked}
                onUpdateVendorNotes={handleUpdateVendorNotes}
              />
            )}

            {/* Section 4: 5 Personalized Traditions */}
            {(activeTab === "all" || activeTab === "traditions") && (
              <TraditionsSection
                traditions={activePlan.personalizedTraditions}
                onToggleFavorite={handleToggleFavoriteTradition}
              />
            )}

            {/* Section 5: Cultural and Local Advice */}
            {(activeTab === "all" || activeTab === "advice") && (
              <CulturalTipsSection
                tips={activePlan.culturalTipsAndAdvice}
                city={activePlan.inputs.city}
              />
            )}

            {/* Bottom Plan Another / Edit Inputs */}
            <div className="p-8 rounded-3xl bg-white border border-[#EEDBCA] shadow-xs text-center no-print">
              <h3 className="text-lg font-bold text-[#2C1810] font-serif-indian">
                Need to tweak event parameters?
              </h3>
              <p className="text-xs text-stone-600 mt-1 mb-4">
                You can generate another plan with different guest counts, date, or budget anytime.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2C1810] text-white text-xs font-bold hover:bg-stone-800 transition-colors shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Adjust Parameters & Re-Plan</span>
              </button>
            </div>
          </div>
        )}

        {/* If no active plan and not loading: Show Planner Form */}
        {!isLoading && !activePlan && (
          <div className="space-y-8">
            <PlannerForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              initialInputs={lastInputs || undefined}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#F0E6D8] bg-white py-6 text-center text-xs text-stone-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#E05A1B] font-serif-indian">Utsav</span>
            <span>• Celebrating Indian Traditions with Modern Planning Intelligence</span>
          </div>
          <div className="text-stone-400">
            INR Budgeting • Reverse Milestones • Panditji & Vendor Checklist
          </div>
        </div>
      </footer>

      {/* Saved Plans Modal */}
      <SavedPlansModal
        isOpen={isSavedPlansOpen}
        onClose={() => setIsSavedPlansOpen(false)}
        plans={savedPlans}
        onSelectPlan={(plan) => {
          setActivePlan(plan);
          setLastInputs(plan.inputs);
        }}
        onDeletePlan={handleDeleteSavedPlan}
      />
    </div>
  );
}
