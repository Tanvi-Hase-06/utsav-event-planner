export interface EventInput {
  eventType: string;
  date: string;
  city: string;
  guestCount: number;
  budgetINR: number;
  customsNotes: string;
  todayDate?: string;
  isTightBudget?: boolean;
}

export interface BudgetItem {
  id: string;
  category: string;
  percent: number;
  amountINR: number;
  description: string;
  costSavingTip: string;
}

export interface TimelineTask {
  id: string;
  title: string;
  description: string;
  targetMilestoneDays: number;
  daysBeforeEvent?: number;
  milestoneDate?: string;
  priority: "urgent" | "high" | "medium" | "normal" | string;
  isUrgent?: boolean;
  category: string;
  isCompleted?: boolean;
}

export interface TimelinePhase {
  phaseId: string;
  timeframe: string;
  milestoneDate?: string;
  daysBeforeEvent?: number;
  isCompressed?: boolean;
  tasks: TimelineTask[];
}

export interface VendorItem {
  id: string;
  vendorRole: string;
  importance: "Crucial" | "High" | "Recommended" | string;
  targetHireTimeline: string;
  averageEstimatedCostINR: number;
  typicalDeliverables: string;
  questionsToAsk: string[];
  isBooked?: boolean;
  vendorName?: string;
  actualCostINR?: number;
  notes?: string;
}

export interface PersonalizedTradition {
  id: string;
  title: string;
  ritualContext: string;
  howToExecute: string;
  approximateCostLevel: "Budget-friendly" | "Moderate" | "Luxury" | string;
  culturalHighlight: string;
  isFavorited?: boolean;
}

export interface EventPlan {
  id: string;
  generatedAt: string;
  inputs: EventInput;
  daysUntilEvent?: number;
  todayDate?: string;
  isTimelineCompressed?: boolean;
  isTightBudget?: boolean;
  eventSummary: {
    title: string;
    tagline: string;
    auspiciousNote: string;
    estimatedTotalBudget: number;
    perGuestBudget: number;
    contingencyFund: number;
    cityContext: string;
  };
  budgetBreakdown: BudgetItem[];
  reverseTimeline: TimelinePhase[];
  vendorChecklist: VendorItem[];
  personalizedTraditions: PersonalizedTradition[];
  culturalTipsAndAdvice: string[];
}
