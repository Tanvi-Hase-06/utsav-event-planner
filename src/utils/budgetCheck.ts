export interface BudgetRealityCheckResult {
  isTight: boolean;
  perGuest: number;
  threshold: number;
  suggestedMinimumBudget: number;
  difference: number;
  eventCategory: "wedding" | "birthday" | "community" | "other";
  benchmarkLabel: string;
  reasonMessage: string;
  adviceMessage: string;
}

/**
 * Determine the Indian market per-guest threshold based on celebration type:
 * - Wedding / Shaadi: ₹1,500 / guest
 * - Birthday / Janamdin: ₹500 / guest
 * - Community Festival / Pooja: ₹250 / guest
 * - Others: ₹500 / guest
 */
export function getBudgetThreshold(eventType: string): {
  threshold: number;
  eventCategory: "wedding" | "birthday" | "community" | "other";
  benchmarkLabel: string;
} {
  const normalized = (eventType || "").toLowerCase();

  if (
    normalized.includes("wedding") ||
    normalized.includes("shaadi") ||
    normalized.includes("sangeet") ||
    normalized.includes("haldi") ||
    normalized.includes("mehendi") ||
    normalized.includes("roka") ||
    normalized.includes("sagai") ||
    normalized.includes("engagement")
  ) {
    return {
      threshold: 1500,
      eventCategory: "wedding",
      benchmarkLabel: "₹1,500 / guest for Indian Weddings",
    };
  }

  if (normalized.includes("birthday") || normalized.includes("janamdin")) {
    return {
      threshold: 500,
      eventCategory: "birthday",
      benchmarkLabel: "₹500 / guest for Birthday Celebrations",
    };
  }

  if (
    normalized.includes("community") ||
    normalized.includes("festival") ||
    normalized.includes("ganesh") ||
    normalized.includes("utsav") ||
    normalized.includes("diwali") ||
    normalized.includes("navratri") ||
    normalized.includes("pooja") ||
    normalized.includes("puja") ||
    normalized.includes("satyanarayan") ||
    normalized.includes("griha")
  ) {
    return {
      threshold: 250,
      eventCategory: "community",
      benchmarkLabel: "₹250 / guest for Community Festivals & Pujas",
    };
  }

  return {
    threshold: 500,
    eventCategory: "other",
    benchmarkLabel: "₹500 / guest for Celebrations",
  };
}

/**
 * Perform a budget reality check comparing proposed budget to Indian market benchmarks
 */
export function checkBudgetReality(params: {
  eventType: string;
  guestCount: number;
  budgetINR: number;
}): BudgetRealityCheckResult {
  const { eventType, guestCount, budgetINR } = params;
  const guests = Math.max(1, guestCount || 1);
  const perGuest = Math.round(budgetINR / guests);
  const { threshold, eventCategory, benchmarkLabel } = getBudgetThreshold(eventType);

  const isTight = perGuest < threshold;
  const suggestedMinimumBudget = guests * threshold;
  const difference = Math.max(0, suggestedMinimumBudget - budgetINR);

  let reasonMessage = "";
  let adviceMessage = "";

  if (eventCategory === "wedding") {
    reasonMessage = `At ₹${perGuest.toLocaleString("en-IN")}/guest, this is below the typical Indian wedding benchmark of ₹1,500/guest. Multi-course banquet catering, mandap decor, sound, and bridal styling in Indian cities usually exceed this range.`;
    adviceMessage = `You can continue with an economy strategy (simple community hall, pure veg single-cuisine buffet, marigold-only decor, and digital e-invites) or adjust to the suggested minimum.`;
  } else if (eventCategory === "birthday") {
    reasonMessage = `At ₹${perGuest.toLocaleString("en-IN")}/guest, this is below the ₹500/guest benchmark for birthdays. Cake, live snack/chaat counters, balloon decor, and entertainment games typically cost at least ₹500/attendee.`;
    adviceMessage = `You can proceed with a streamlined DIY home/park party with homemade snacks and digital games, or upgrade to the suggested budget.`;
  } else if (eventCategory === "community") {
    reasonMessage = `At ₹${perGuest.toLocaleString("en-IN")}/guest, this is below the ₹250/guest community threshold. Mahaprasad preparation, sound permits, idol sthapana, and tent rentals require foundational expenses.`;
    adviceMessage = `You can continue with volunteer-driven cooking and temple grounds, or scale up budget to ensure abundant prasad for everyone.`;
  } else {
    reasonMessage = `At ₹${perGuest.toLocaleString("en-IN")}/guest, this is on the tighter side for an event of this scale in India.`;
    adviceMessage = `Gemini will focus strictly on essential categories, aggressive local cost-saving hacks, and a protective 5-10% contingency reserve.`;
  }

  return {
    isTight,
    perGuest,
    threshold,
    suggestedMinimumBudget,
    difference,
    eventCategory,
    benchmarkLabel,
    reasonMessage,
    adviceMessage,
  };
}
