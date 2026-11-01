import React, { useState } from "react";
import {
  Users,
  CheckCircle2,
  Circle,
  HelpCircle,
  IndianRupee,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Phone,
  Edit3,
} from "lucide-react";
import { VendorItem } from "../types/planner";
import { formatINR } from "../utils/formatters";

interface VendorChecklistSectionProps {
  vendors: VendorItem[];
  onToggleBooked: (vendorId: string) => void;
  onUpdateVendorNotes: (vendorId: string, notes: string, vendorName?: string) => void;
}

export const VendorChecklistSection: React.FC<VendorChecklistSectionProps> = ({
  vendors,
  onToggleBooked,
  onUpdateVendorNotes,
}) => {
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(vendors[0]?.id || null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [tempName, setTempName] = useState("");

  const bookedCount = vendors.filter((v) => v.isBooked).length;
  const totalCost = vendors.reduce((acc, v) => acc + (v.actualCostINR || v.averageEstimatedCostINR), 0);

  const startEditingNotes = (v: VendorItem) => {
    setEditingNotesId(v.id);
    setTempNotes(v.notes || "");
    setTempName(v.vendorName || "");
  };

  const saveNotes = (vId: string) => {
    onUpdateVendorNotes(vId, tempNotes, tempName);
    setEditingNotesId(null);
  };

  const getImportanceColor = (imp: string) => {
    switch (imp.toLowerCase()) {
      case "crucial":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "high":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
  };

  return (
    <section aria-labelledby="vendor-checklist-heading" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#EEDBCA] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E05A1B]">
            <Users className="w-4 h-4" />
            <span>Vendors & Partners</span>
          </div>
          <h2
            id="vendor-checklist-heading"
            className="text-2xl font-bold text-[#2C1810] font-serif-indian"
          >
            Indian Vendor Checklist & Negotiation Guide
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Key professionals for Indian traditions (Catering, Panditji, Mehendi, Dhol, Decor & Photo).
          </p>
        </div>

        {/* Booked progress pill */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-[#EADBCA] shadow-2xs">
          <span className="text-xs font-medium text-stone-600">Vendors Booked:</span>
          <span className="text-sm font-extrabold text-[#E05A1B]">
            {bookedCount} of {vendors.length}
          </span>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 gap-4">
        {vendors.map((vendor) => {
          const isExpanded = expandedVendorId === vendor.id;
          const isEditing = editingNotesId === vendor.id;

          return (
            <div
              key={vendor.id}
              className={`bg-white rounded-3xl border transition-all duration-200 shadow-xs ${
                vendor.isBooked
                  ? "border-emerald-200 bg-emerald-50/15"
                  : isExpanded
                  ? "border-amber-300 ring-2 ring-amber-100"
                  : "border-[#EFE4D6]"
              }`}
            >
              {/* Card Summary Line */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Tickbox button */}
                  <button
                    type="button"
                    onClick={() => onToggleBooked(vendor.id)}
                    className="mt-0.5 shrink-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label={
                      vendor.isBooked
                        ? `Mark ${vendor.vendorRole} as pending`
                        : `Mark ${vendor.vendorRole} as booked`
                    }
                  >
                    {vendor.isBooked ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-6 h-6 text-stone-300 hover:text-stone-400" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        onClick={() =>
                          setExpandedVendorId(isExpanded ? null : vendor.id)
                        }
                        className={`text-base font-bold cursor-pointer hover:text-orange-600 transition-colors ${
                          vendor.isBooked ? "text-emerald-900" : "text-[#2B180F]"
                        }`}
                      >
                        {vendor.vendorRole}
                      </h3>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getImportanceColor(
                          vendor.importance
                        )}`}
                      >
                        {vendor.importance}
                      </span>

                      {vendor.isBooked && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          BOOKED ✓
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                      <span className="flex items-center gap-1 text-[#8C3A00] font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {vendor.targetHireTimeline}
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-xs">{vendor.typicalDeliverables}</span>
                    </div>

                    {vendor.vendorName && (
                      <div className="mt-1 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                        <span>Hired Vendor:</span>
                        <span className="bg-emerald-100 px-2 py-0.5 rounded-md">
                          {vendor.vendorName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Estimated Cost & Accordion Toggle */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <div className="text-right">
                    <span className="text-[11px] text-stone-500 block">Est. Market Rate</span>
                    <span className="text-base font-extrabold text-[#2C1810]">
                      {formatINR(vendor.averageEstimatedCostINR)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedVendorId(isExpanded ? null : vendor.id)}
                    className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
                    aria-label={isExpanded ? "Collapse vendor details" : "Expand vendor details"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded details: Questions to Ask & Notes */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-[#F5ECE0] bg-[#FFFDF9] rounded-b-3xl space-y-4">
                  {/* Critical Questions to Ask */}
                  {vendor.questionsToAsk && vendor.questionsToAsk.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C3A00] uppercase tracking-wider">
                        <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
                        <span>Crucial Questions to Ask Before Hiring</span>
                      </div>
                      <ul className="space-y-1.5 bg-white p-3.5 rounded-2xl border border-[#F0E6D8] text-xs text-stone-700">
                        {vendor.questionsToAsk.map((q, qIdx) => (
                          <li key={qIdx} className="flex items-start gap-2">
                            <span className="text-orange-500 font-bold">•</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Vendor Contact & Notes Editor */}
                  <div className="bg-white p-3.5 rounded-2xl border border-[#F0E6D8] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                        <span>Vendor Contact Details & Quotation Notes</span>
                      </span>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => startEditingNotes(vendor)}
                          className="text-xs font-semibold text-[#E05A1B] hover:underline"
                        >
                          {vendor.notes || vendor.vendorName ? "Edit Notes" : "+ Add Contact / Note"}
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 pt-1">
                        <input
                          type="text"
                          placeholder="Vendor Name / Agency / Contact Phone"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <textarea
                          rows={2}
                          placeholder="Notes: Final agreed quote, payment advance status, tasting date..."
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingNotesId(null)}
                            className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveNotes(vendor.id)}
                            className="px-3 py-1 text-xs font-bold text-white bg-[#E05A1B] rounded-lg hover:bg-orange-600 shadow-xs"
                          >
                            Save Details
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500 italic">
                        {vendor.notes || "No notes added yet. Click above to save vendor contact or quotes."}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
