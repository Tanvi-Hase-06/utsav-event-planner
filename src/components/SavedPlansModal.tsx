import React, { useEffect } from "react";
import { X, Calendar, MapPin, Users, IndianRupee, Trash2, ArrowRight, Bookmark } from "lucide-react";
import { EventPlan } from "../types/planner";
import { formatINR, formatInIndianWords, formatPrettyDate } from "../utils/formatters";

interface SavedPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: EventPlan[];
  onSelectPlan: (plan: EventPlan) => void;
  onDeletePlan: (planId: string) => void;
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({
  isOpen,
  onClose,
  plans,
  onSelectPlan,
  onDeletePlan,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-plans-title"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#FAF6EE] border-b border-[#EEDBCA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-100 text-[#E05A1B]">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 id="saved-plans-title" className="text-lg font-bold text-[#2C1810] font-serif-indian">
                Saved Celebration Blueprints
              </h3>
              <p className="text-xs text-stone-500">
                Switch between your cached events or restore previous planning sessions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {plans.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <Bookmark className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-semibold">No saved plans yet</p>
              <p className="text-xs text-stone-400 mt-1">
                Generate an event plan and click "Save Plan" to store it here for offline access.
              </p>
            </div>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className="group p-4 rounded-2xl border border-[#EFE5D8] hover:border-amber-300 hover:bg-amber-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#2C1810]">
                      {plan.eventSummary.title}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-[#8C3A00]">
                      {plan.inputs.eventType}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#E05A1B]" />
                      {plan.inputs.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#E05A1B]" />
                      {formatPrettyDate(plan.inputs.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      {plan.inputs.guestCount} Guests
                    </span>
                    <span className="font-bold text-[#2C1810]">
                      {formatINR(plan.inputs.budgetINR)} ({formatInIndianWords(plan.inputs.budgetINR)})
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPlan(plan);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-[#E05A1B] hover:bg-orange-600 rounded-xl shadow-2xs transition-colors"
                  >
                    <span>View Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeletePlan(plan.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete saved plan"
                    aria-label={`Delete plan ${plan.eventSummary.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
