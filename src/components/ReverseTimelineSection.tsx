import React, { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { TimelinePhase, TimelineTask } from "../types/planner";
import { formatPrettyDate, computeMilestoneDate } from "../utils/formatters";

interface ReverseTimelineSectionProps {
  phases: TimelinePhase[];
  onToggleTask: (phaseId: string, taskId: string) => void;
  onAddTask: (phaseId: string, task: TimelineTask) => void;
  eventDate: string;
  todayDate?: string;
  isTimelineCompressed?: boolean;
  daysUntilEvent?: number;
}

export const ReverseTimelineSection: React.FC<ReverseTimelineSectionProps> = ({
  phases,
  onToggleTask,
  onAddTask,
  eventDate,
  todayDate = new Date().toISOString().split("T")[0],
  isTimelineCompressed = false,
  daysUntilEvent = 90,
}) => {
  const [activePhaseId, setActivePhaseId] = useState<string | "all" | "urgent">("all");
  const [addingToPhaseId, setAddingToPhaseId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Vendors");
  const [newTaskIsUrgent, setNewTaskIsUrgent] = useState(false);

  // Calculate overall completion and urgent count
  let totalTasks = 0;
  let completedTasks = 0;
  let urgentTasksCount = 0;

  phases.forEach((p) => {
    p.tasks.forEach((t) => {
      totalTasks++;
      if (t.isCompleted) completedTasks++;
      if (t.isUrgent || t.priority === "urgent") urgentTasksCount++;
    });
  });

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleCreateTask = (phaseId: string) => {
    if (!newTaskTitle.trim()) return;

    const targetPhase = phases.find((p) => p.phaseId === phaseId);
    const phaseDays = targetPhase?.daysBeforeEvent ?? 0;
    const computed = computeMilestoneDate(eventDate, phaseDays, todayDate);

    const newTask: TimelineTask = {
      id: `custom_${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || "Custom celebration milestone task",
      targetMilestoneDays: computed.actualDaysBefore,
      daysBeforeEvent: computed.actualDaysBefore,
      milestoneDate: computed.dateStr,
      priority: newTaskIsUrgent ? "urgent" : "medium",
      isUrgent: newTaskIsUrgent,
      category: newTaskCategory,
      isCompleted: false,
    };

    onAddTask(phaseId, newTask);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskIsUrgent(false);
    setAddingToPhaseId(null);
  };

  const getPriorityBadge = (priority: string, isUrgent?: boolean) => {
    if (isUrgent || priority?.toLowerCase() === "urgent") {
      return "bg-red-100 text-red-800 border-red-300 font-extrabold flex items-center gap-1 shadow-2xs";
    }
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-rose-100 text-rose-800 border-rose-200 font-bold";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200 font-medium";
      default:
        return "bg-stone-100 text-stone-700 border-stone-200 font-medium";
    }
  };

  const getCategoryColor = (cat: string) => {
    if (cat.includes("Ritual") || cat.includes("Pooja")) return "text-red-700 bg-red-50 border-red-200";
    if (cat.includes("Wardrobe") || cat.includes("Attire")) return "text-purple-700 bg-purple-50 border-purple-200";
    if (cat.includes("Vendor")) return "text-orange-700 bg-orange-50 border-orange-200";
    if (cat.includes("Invitation")) return "text-sky-700 bg-sky-50 border-sky-200";
    return "text-emerald-700 bg-emerald-50 border-emerald-200";
  };

  return (
    <section aria-labelledby="reverse-timeline-heading" className="space-y-6">
      {/* Header with Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EEDBCA] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E05A1B]">
            <Clock className="w-4 h-4" />
            <span>Milestone Countdown • Real-Time Calendar</span>
          </div>
          <h2
            id="reverse-timeline-heading"
            className="text-2xl font-bold text-[#2C1810] font-serif-indian"
          >
            Reverse Timeline & Interactive Checklist
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Milestone dates computed strictly backward from event date ({formatPrettyDate(eventDate)}). No dates in the past.
          </p>
        </div>

        {/* Task Completion Badge & Bar */}
        <div className="bg-white px-4 py-2.5 rounded-2xl border border-[#EADBCA] shadow-2xs min-w-[200px]">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-stone-700">Checklist Progress</span>
            <span className="text-[#E05A1B]">{completedTasks}/{totalTasks} ({completionPercent}%)</span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E05A1B] to-emerald-500 transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Compressed Fast-Track Timeline Notice (< 3 Months Away) */}
      {isTimelineCompressed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 shadow-xs flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-orange-600 text-white shrink-0 shadow-xs">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#A5470D]">
                Fast-Track Timeline Activated
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                {daysUntilEvent} Days Remaining (&lt; 3 Months)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#52290D] font-medium leading-relaxed mt-1">
              Your celebration is within the next 3 months. All milestones have been consolidated into weekly fast-track sprints starting today ({formatPrettyDate(todayDate)}) up to {formatPrettyDate(eventDate)}. Critical long-lead items (venues, catering, panditji booking) are flagged as <strong className="text-red-700">⚡ URGENT</strong> for immediate execution.
            </p>
          </div>
        </div>
      )}

      {/* Phase Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActivePhaseId("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            activePhaseId === "all"
              ? "bg-[#2C1810] text-white shadow-xs"
              : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          All Milestones ({totalTasks})
        </button>

        {urgentTasksCount > 0 && (
          <button
            onClick={() => setActivePhaseId("urgent")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 border ${
              activePhaseId === "urgent"
                ? "bg-red-600 text-white border-red-600 shadow-xs"
                : "bg-red-50 text-red-800 hover:bg-red-100 border-red-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Urgent Tasks ({urgentTasksCount})</span>
          </button>
        )}

        {phases.map((p) => {
          const phaseCompleted = p.tasks.filter((t) => t.isCompleted).length;
          return (
            <button
              key={p.phaseId}
              onClick={() => setActivePhaseId(p.phaseId)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                activePhaseId === p.phaseId
                  ? "bg-[#E05A1B] text-white border-[#E05A1B] shadow-xs"
                  : "bg-white text-stone-700 hover:bg-stone-100 border-stone-200"
              }`}
            >
              <span>{p.timeframe}</span>
              <span className="ml-1.5 text-[11px] opacity-80">
                ({phaseCompleted}/{p.tasks.length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Phases and Task List */}
      <div className="space-y-6">
        {phases
          .filter((phase) => {
            if (activePhaseId === "all") return true;
            if (activePhaseId === "urgent") {
              return phase.tasks.some((t) => t.isUrgent || t.priority === "urgent");
            }
            return activePhaseId === phase.phaseId;
          })
          .map((phase) => {
            const displayedTasks = activePhaseId === "urgent"
              ? phase.tasks.filter((t) => t.isUrgent || t.priority === "urgent")
              : phase.tasks;

            return (
              <div
                key={phase.phaseId}
                className="bg-white rounded-3xl border border-[#EFE4D6] shadow-xs overflow-hidden"
              >
                {/* Phase Banner */}
                <div className="bg-[#FAF5ED] px-5 py-3.5 border-b border-[#EFE4D6] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E05A1B]" />
                    <h3 className="text-sm font-bold text-[#2A160A] uppercase tracking-wide">
                      {phase.timeframe}
                    </h3>
                    {phase.milestoneDate && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-900 border border-amber-200/60 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#E05A1B]" />
                        <span>{formatPrettyDate(phase.milestoneDate)}</span>
                        {phase.daysBeforeEvent !== undefined && (
                          <span className="text-[10px] text-amber-700">
                            ({phase.daysBeforeEvent === 0 ? "Event Day" : `${phase.daysBeforeEvent}d before`})
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAddingToPhaseId(addingToPhaseId === phase.phaseId ? null : phase.phaseId)
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C3A00] hover:text-[#502000] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                </div>

                {/* Add Custom Task Form inline */}
                {addingToPhaseId === phase.phaseId && (
                  <div className="p-4 bg-amber-50/70 border-b border-amber-200">
                    <h4 className="text-xs font-bold text-amber-900 mb-2">Add New Custom Milestone Task</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Task Title (e.g. Confirm Guruji Dakshina)"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="sm:col-span-2 px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      <select
                        value={newTaskCategory}
                        onChange={(e) => setNewTaskCategory(e.target.value)}
                        className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
                      >
                        <option value="Ritual / Pooja">Ritual / Pooja</option>
                        <option value="Wardrobe">Wardrobe</option>
                        <option value="Vendors">Vendors</option>
                        <option value="Invitations">Invitations</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Guest Care">Guest Care</option>
                      </select>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-semibold text-red-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newTaskIsUrgent}
                          onChange={(e) => setNewTaskIsUrgent(e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-400"
                        />
                        <span>Mark as ⚡ URGENT Priority</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAddingToPhaseId(null)}
                          className="px-3 py-1 text-xs text-stone-600 hover:text-stone-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCreateTask(phase.phaseId)}
                          className="px-3.5 py-1 text-xs font-bold text-white bg-[#E05A1B] rounded-lg hover:bg-orange-600 shadow-xs"
                        >
                          Save Task
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tasks List with interactive check-boxes */}
                <ul className="divide-y divide-[#F6EFE6]">
                  {displayedTasks.map((task) => {
                    const isUrgent = task.isUrgent || task.priority === "urgent";

                    return (
                      <li
                        key={task.id}
                        className={`p-4 sm:p-5 flex items-start gap-3.5 transition-colors ${
                          task.isCompleted
                            ? "bg-[#FBFDFB]"
                            : isUrgent
                            ? "bg-red-50/25 hover:bg-red-50/40 border-l-4 border-l-red-500"
                            : "hover:bg-[#FFFDFB]"
                        }`}
                      >
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => onToggleTask(phase.phaseId, task.id)}
                          className="mt-0.5 shrink-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          aria-label={
                            task.isCompleted
                              ? `Mark ${task.title} as incomplete`
                              : `Mark ${task.title} as completed`
                          }
                        >
                          {task.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-5 h-5 text-stone-300 hover:text-stone-400" />
                          )}
                        </button>

                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              className={`text-sm font-bold ${
                                task.isCompleted
                                  ? "line-through text-stone-400 font-medium"
                                  : "text-[#2B180F]"
                              }`}
                            >
                              {task.title}
                            </span>

                            {/* Urgent Badge */}
                            {isUrgent && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-600 text-white flex items-center gap-1 shadow-2xs">
                                <Zap className="w-3 h-3 fill-white" />
                                <span>URGENT</span>
                              </span>
                            )}

                            {/* Priority Badge */}
                            {!isUrgent && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full border ${getPriorityBadge(
                                  task.priority,
                                  task.isUrgent
                                )}`}
                              >
                                {task.priority.toUpperCase()}
                              </span>
                            )}

                            {/* Category Badge */}
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getCategoryColor(
                                task.category
                              )}`}
                            >
                              {task.category}
                            </span>

                            {/* Computed Milestone Date Badge */}
                            {task.milestoneDate && (
                              <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200 flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5 text-[#E05A1B]" />
                                <span>{formatPrettyDate(task.milestoneDate)}</span>
                                {task.targetMilestoneDays !== undefined && (
                                  <span className="text-stone-500">
                                    ({task.targetMilestoneDays === 0 ? "Event Day" : `${task.targetMilestoneDays}d before`})
                                  </span>
                                )}
                              </span>
                            )}
                          </div>

                          <p
                            className={`text-xs leading-relaxed ${
                              task.isCompleted ? "text-stone-400 line-through" : "text-stone-600"
                            }`}
                          >
                            {task.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
      </div>
    </section>
  );
};
