import { EventInput, EventPlan, TimelinePhase, TimelineTask } from "../types/planner";

/**
 * Format currency in Indian numbering format (e.g., ₹1,50,000)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convert number to readable Lakhs or Crores representation
 * e.g., 500000 -> "5 Lakhs", 2500000 -> "25 Lakhs", 15000000 -> "1.5 Crores"
 */
export function formatInIndianWords(amount: number): string {
  if (!amount || isNaN(amount)) return "₹0";
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(1)} Lakhs`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `₹${k % 1 === 0 ? k : k.toFixed(0)}k`;
  }
  return formatINR(amount);
}

/**
 * Calculate days remaining until the target date from today
 */
export function getDaysRemaining(targetDateStr: string, baseTodayStr?: string): {
  days: number;
  label: string;
  isPast: boolean;
  isToday: boolean;
} {
  const target = new Date(targetDateStr);
  const now = baseTodayStr ? new Date(baseTodayStr) : new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { days: 0, label: "Today is the Auspicious Day!", isPast: false, isToday: true };
  } else if (diffDays < 0) {
    return { days: Math.abs(diffDays), label: `${Math.abs(diffDays)} days ago`, isPast: true, isToday: false };
  } else if (diffDays === 1) {
    return { days: 1, label: "Tomorrow is the Big Day!", isPast: false, isToday: false };
  } else {
    return { days: diffDays, label: `${diffDays} days to go`, isPast: false, isToday: false };
  }
}

/**
 * Format date string to Indian format, e.g. Sat, 15 Nov 2026
 */
export function formatPrettyDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Compute milestone date by subtracting daysBefore from eventDate.
 * Guarantees that the resulting date is NEVER before today.
 */
export function computeMilestoneDate(
  eventDateStr: string,
  daysBefore: number,
  todayStr: string
): { dateStr: string; clampedToToday: boolean; actualDaysBefore: number } {
  const eventDate = new Date(eventDateStr);
  const today = new Date(todayStr);
  eventDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const totalAvailableDays = Math.max(0, Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // If milestone days exceed available days, clamp to today
  if (daysBefore >= totalAvailableDays) {
    return {
      dateStr: todayStr,
      clampedToToday: true,
      actualDaysBefore: totalAvailableDays,
    };
  }

  const computed = new Date(eventDate);
  computed.setDate(eventDate.getDate() - Math.max(0, daysBefore));
  computed.setHours(0, 0, 0, 0);

  // If computed date is before today, clamp to today
  if (computed < today) {
    return {
      dateStr: todayStr,
      clampedToToday: true,
      actualDaysBefore: totalAvailableDays,
    };
  }

  const year = computed.getFullYear();
  const month = String(computed.getMonth() + 1).padStart(2, "0");
  const day = String(computed.getDate()).padStart(2, "0");

  return {
    dateStr: `${year}-${month}-${day}`,
    clampedToToday: false,
    actualDaysBefore: daysBefore,
  };
}

/**
 * Normalizes all timeline phases and tasks:
 * - Computes milestone dates strictly counting back from event date
 * - Guarantees NEVER showing any past dates (clamps to today)
 * - Flags urgent tasks if timeline is compressed (< 90 days) or milestone is within 7 days
 */
export function normalizeTimelinePhases(
  phases: TimelinePhase[],
  eventDateStr: string,
  todayStr: string,
  isCompressed: boolean
): TimelinePhase[] {
  return phases.map((phase) => {
    // If phase has daysBeforeEvent or fallback from first task
    const phaseDays = phase.daysBeforeEvent ?? phase.tasks[0]?.targetMilestoneDays ?? 0;
    const computedPhase = computeMilestoneDate(eventDateStr, phaseDays, todayStr);

    const updatedTasks: TimelineTask[] = phase.tasks.map((task) => {
      const taskDays = task.daysBeforeEvent ?? task.targetMilestoneDays ?? phaseDays;
      const computedTask = computeMilestoneDate(eventDateStr, taskDays, todayStr);

      const daysUntilTask = Math.max(
        0,
        Math.ceil((new Date(computedTask.dateStr).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24))
      );

      // Mark urgent if already marked, clamped to today, or in immediate window (< 7 days in compressed mode)
      const isUrgent =
        task.isUrgent === true ||
        task.priority?.toLowerCase() === "urgent" ||
        computedTask.clampedToToday ||
        (isCompressed && daysUntilTask <= 7);

      return {
        ...task,
        targetMilestoneDays: computedTask.actualDaysBefore,
        daysBeforeEvent: computedTask.actualDaysBefore,
        milestoneDate: computedTask.dateStr,
        isUrgent,
        priority: isUrgent ? "urgent" : task.priority || "medium",
      };
    });

    return {
      ...phase,
      daysBeforeEvent: computedPhase.actualDaysBefore,
      milestoneDate: computedPhase.dateStr,
      isCompressed: isCompressed || phase.isCompressed,
      tasks: updatedTasks,
    };
  });
}

/**
 * Generates a cache key for caching plan responses in localStorage
 */
export function generateCacheKey(input: EventInput): string {
  const todayKey = input.todayDate || new Date().toISOString().split("T")[0];
  return `utsav_plan_v2_${input.eventType}_${input.city}_${input.date}_${input.guestCount}_${input.budgetINR}_${todayKey}`
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_");
}

const STORAGE_KEY_RECENT_PLANS = "utsav_saved_plans_v2";
const STORAGE_KEY_ACTIVE_PLAN = "utsav_active_plan_v2";

export function loadSavedPlans(): EventPlan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_RECENT_PLANS);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.warn("Error loading saved plans from localStorage", err);
    return [];
  }
}

export function savePlanToStorage(plan: EventPlan): void {
  try {
    const existing = loadSavedPlans();
    const filtered = existing.filter((p) => p.id !== plan.id);
    const updated = [plan, ...filtered].slice(0, 10);
    localStorage.setItem(STORAGE_KEY_RECENT_PLANS, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEY_ACTIVE_PLAN, JSON.stringify(plan));
  } catch (err) {
    console.warn("Error saving plan to localStorage", err);
  }
}

export function loadActivePlan(): EventPlan | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_ACTIVE_PLAN);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn("Error loading active plan from localStorage", err);
    return null;
  }
}

export function clearActivePlan(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_PLAN);
  } catch (err) {
    console.warn("Error clearing active plan", err);
  }
}
