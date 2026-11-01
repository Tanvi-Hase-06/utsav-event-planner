import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "5mb" }));

// Server-side Gemini client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Compute milestone date helper (guarantees date is never in the past)
function computeSafeMilestoneDate(eventDateStr: string, daysBefore: number, todayStr: string) {
  const eventDate = new Date(eventDateStr);
  const today = new Date(todayStr);
  eventDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const totalAvailableDays = Math.max(0, Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const safeDaysBefore = Math.min(Math.max(0, daysBefore), totalAvailableDays);

  const computed = new Date(eventDate);
  computed.setDate(eventDate.getDate() - safeDaysBefore);
  computed.setHours(0, 0, 0, 0);

  const targetDate = computed < today ? today : computed;
  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, "0");
  const d = String(targetDate.getDate()).padStart(2, "0");

  return {
    dateStr: `${y}-${m}-${d}`,
    actualDaysBefore: Math.max(0, Math.ceil((eventDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24))),
    wasClamped: computed < today,
  };
}

// Resilient smart plan generator (used if Gemini is on temporary 503 spike or as reliable fallback)
function generateCuratedIndianEventPlan(params: {
  eventType: string;
  date: string;
  city: string;
  guestCount: number;
  budgetINR: number;
  customsNotes?: string;
  todayStr: string;
  daysUntilEvent: number;
  isCompressed: boolean;
  isTightBudget?: boolean;
}) {
  const { eventType, date, city, guestCount, budgetINR, customsNotes, todayStr, daysUntilEvent, isCompressed, isTightBudget } = params;

  // Build reverse timeline phases strictly counting back from date
  let timelinePhases: any[] = [];

  if (isCompressed) {
    // Under 3 months (< 90 days) - compressed into available weekly sprints
    // Phase 1: Immediate Sprint (Starting Today)
    const p1Date = todayStr;
    const p1DaysBefore = daysUntilEvent;
    timelinePhases.push({
      phaseId: "phase_immediate",
      timeframe: `Immediate Sprint (Starting Today)`,
      milestoneDate: p1Date,
      daysBeforeEvent: p1DaysBefore,
      isCompressed: true,
      tasks: [
        {
          id: "task_imm_1",
          title: `Lock & Book ${isTightBudget ? "Community / Society Hall" : "Banquet / Venue"} in ${city}`,
          description: isTightBudget
            ? `Inspect community hall, society clubhouse or temple premises for ${guestCount} guests to keep rental costs minimal. Pay advance deposit.`
            : `Crucial first step: Inspect hall availability, parking, and AC/generator backup for ${guestCount} guests. Pay advance deposit.`,
          targetMilestoneDays: p1DaysBefore,
          milestoneDate: p1Date,
          priority: "urgent",
          isUrgent: true,
          category: "Logistics",
        },
        {
          id: "task_imm_2",
          title: "Book Authentic Regional Caterer & Mithai Halwai",
          description: isTightBudget
            ? "Negotiate a high-quality single-cuisine satvik buffet or thali with local halwai; skip expensive multi-cuisine stalls."
            : "Finalize per-plate cost, live chaat/jalebi counters, tasting session, and dietary preferences (pure veg / Jain).",
          targetMilestoneDays: p1DaysBefore,
          milestoneDate: p1Date,
          priority: "urgent",
          isUrgent: true,
          category: "Vendors",
        },
        {
          id: "task_imm_3",
          title: "Confirm Vedic Panditji / Officiant & Muhurat Time",
          description: "Lock auspicious lagna / pooja timings, obtain complete puja samagri list, and confirm dakshina.",
          targetMilestoneDays: p1DaysBefore,
          milestoneDate: p1Date,
          priority: "urgent",
          isUrgent: true,
          category: "Ritual / Pooja",
        },
        {
          id: "task_imm_4",
          title: "Broadcast Digital E-Invites & WhatsApp Save-the-Date",
          description: `Fast-track guest notice: Share digital animated card, Google Maps location, and RSVP link with all ${guestCount} attendees (zero printing cost).`,
          targetMilestoneDays: p1DaysBefore,
          milestoneDate: p1Date,
          priority: "urgent",
          isUrgent: true,
          category: "Invitations",
        },
      ],
    });

    if (daysUntilEvent > 21) {
      // Phase 2: 3 to 4 Weeks Before
      const p2DaysBefore = Math.min(28, Math.floor(daysUntilEvent * 0.6));
      const p2Milestone = computeSafeMilestoneDate(date, p2DaysBefore, todayStr);
      timelinePhases.push({
        phaseId: "phase_prep",
        timeframe: `${Math.round(p2DaysBefore / 7)} Weeks Before Celebration`,
        milestoneDate: p2Milestone.dateStr,
        daysBeforeEvent: p2Milestone.actualDaysBefore,
        isCompressed: true,
        tasks: [
          {
            id: "task_prep_1",
            title: "Hire Decorator for Marigold Mandap & Lighting",
            description: isTightBudget
              ? "Focus 100% on yellow and orange marigold (genda phool) strings and warm fairy lights directly from wholesale mandi."
              : "Finalize entrance toran, stage backdrop, floral themes (genda phool & jasmine), and ambient mood lighting.",
            targetMilestoneDays: p2Milestone.actualDaysBefore,
            milestoneDate: p2Milestone.dateStr,
            priority: "high",
            isUrgent: false,
            category: "Vendors",
          },
          {
            id: "task_prep_2",
            title: isTightBudget ? "Book Freelance Solo Photographer" : "Book Traditional Photographer & Videographer",
            description: isTightBudget
              ? "Book a versatile single shooter covering both candid portraits and rituals without expensive multi-crew overheads."
              : "Specify coverage requirements (candid portraits, rituals, family groups, highlight reel turnaround).",
            targetMilestoneDays: p2Milestone.actualDaysBefore,
            milestoneDate: p2Milestone.dateStr,
            priority: "high",
            isUrgent: false,
            category: "Vendors",
          },
          {
            id: "task_prep_3",
            title: "Finalize Ethnic Attire, Jewelry & Fitting Trials",
            description: "Complete tailoring, blouse fittings, matching accessories, safa / dupatta, and comfortable footwear.",
            targetMilestoneDays: p2Milestone.actualDaysBefore,
            milestoneDate: p2Milestone.dateStr,
            priority: "medium",
            isUrgent: false,
            category: "Wardrobe",
          },
        ],
      });
    }

    if (daysUntilEvent > 10) {
      // Phase 3: 1 to 2 Weeks Before
      const p3DaysBefore = Math.min(14, Math.floor(daysUntilEvent * 0.35));
      const p3Milestone = computeSafeMilestoneDate(date, p3DaysBefore, todayStr);
      timelinePhases.push({
        phaseId: "phase_2weeks",
        timeframe: "2 Weeks Before (Final Alignment)",
        milestoneDate: p3Milestone.dateStr,
        daysBeforeEvent: p3Milestone.actualDaysBefore,
        isCompressed: true,
        tasks: [
          {
            id: "task_2w_1",
            title: "RSVP Headcount Reconciliation with Caterer",
            description: `Lock exact plate count (+5% tight buffer) to prevent food wastage or sudden shortages for ${guestCount} guests.`,
            targetMilestoneDays: p3Milestone.actualDaysBefore,
            milestoneDate: p3Milestone.dateStr,
            priority: "high",
            isUrgent: false,
            category: "Guest Care",
          },
          {
            id: "task_2w_2",
            title: "Assemble Shagun Envelopes & Return Prasad Favors",
            description: "Package traditional mithai / dry fruit pouches, shagun lifafas, and auspicious prasad tokens.",
            targetMilestoneDays: p3Milestone.actualDaysBefore,
            milestoneDate: p3Milestone.dateStr,
            priority: "medium",
            isUrgent: false,
            category: "Logistics",
          },
          {
            id: "task_2w_3",
            title: "Procure Puja Samagri & Hawan Materials",
            description: "Purchase pure desi ghee, kapoor, gangajal, betel nuts (supari), coconuts, and fresh mango leaves.",
            targetMilestoneDays: p3Milestone.actualDaysBefore,
            milestoneDate: p3Milestone.dateStr,
            priority: "high",
            isUrgent: false,
            category: "Ritual / Pooja",
          },
        ],
      });
    }

    // Phase 4: 3 Days Before
    const p4Milestone = computeSafeMilestoneDate(date, Math.min(3, Math.max(1, daysUntilEvent - 1)), todayStr);
    timelinePhases.push({
      phaseId: "phase_3days",
      timeframe: "3 Days Before Celebration",
      milestoneDate: p4Milestone.dateStr,
      daysBeforeEvent: p4Milestone.actualDaysBefore,
      isCompressed: true,
      tasks: [
        {
          id: "task_3d_1",
          title: "Venue Handover & Sound/Light Dry Run",
          description: `Test sound system, mic checks for announcements/shehnai, and check ${city} municipal noise curfew compliance (10 PM).`,
          targetMilestoneDays: p4Milestone.actualDaysBefore,
          milestoneDate: p4Milestone.dateStr,
          priority: "urgent",
          isUrgent: true,
          category: "Logistics",
        },
        {
          id: "task_3d_2",
          title: "Floral Delivery Reconfirmation with Mandi Vendor",
          description: "Ensure fresh genda phool, rose petals, and jasmine garlands arrive early morning at venue.",
          targetMilestoneDays: p4Milestone.actualDaysBefore,
          milestoneDate: p4Milestone.dateStr,
          priority: "high",
          isUrgent: false,
          category: "Vendors",
        },
      ],
    });

    // Phase 5: Day of Celebration
    timelinePhases.push({
      phaseId: "phase_day_0",
      timeframe: `Day of Celebration (${date})`,
      milestoneDate: date,
      daysBeforeEvent: 0,
      isCompressed: true,
      tasks: [
        {
          id: "task_d0_1",
          title: "Welcome Aarti & Traditional Entrance Greeting",
          description: "Greet arriving guests with traditional chandan tika, rose water sprinkle, and refreshing welcome drinks.",
          targetMilestoneDays: 0,
          milestoneDate: date,
          priority: "urgent",
          isUrgent: true,
          category: "Guest Care",
        },
        {
          id: "task_d0_2",
          title: "Pooja / Main Ceremony Execution as per Shubh Muhurat",
          description: "Ensure Panditji has all samagri arranged before the auspicious muhurat window.",
          targetMilestoneDays: 0,
          milestoneDate: date,
          priority: "urgent",
          isUrgent: true,
          category: "Ritual / Pooja",
        },
        {
          id: "task_d0_3",
          title: "Feast & Food Counter Supervision",
          description: "Coordinate prompt food refills, hot jalebis, clean dining area, and courteous staff hospitality.",
          targetMilestoneDays: 0,
          milestoneDate: date,
          priority: "high",
          isUrgent: false,
          category: "Guest Care",
        },
      ],
    });
  } else {
    // Standard Timeline (>= 90 Days)
    const milestones = [
      { timeframe: "4 to 6 Months Before", days: 150 },
      { timeframe: "2 to 3 Months Before", days: 75 },
      { timeframe: "1 Month Before", days: 30 },
      { timeframe: "2 Weeks Before", days: 14 },
      { timeframe: "3 Days Before", days: 3 },
      { timeframe: `Day of Celebration (${date})`, days: 0 },
    ];

    timelinePhases = milestones.map((m, idx) => {
      const safeM = computeSafeMilestoneDate(date, m.days, todayStr);
      return {
        phaseId: `phase_std_${idx}`,
        timeframe: m.timeframe,
        milestoneDate: safeM.dateStr,
        daysBeforeEvent: safeM.actualDaysBefore,
        isCompressed: false,
        tasks: [
          {
            id: `task_std_${idx}_1`,
            title: idx === 0 ? `Book Banquet Venue in ${city}` : idx === 1 ? "Lock Catering & Panditji" : idx === 2 ? "Send Invitations & Order Mithai" : idx === 3 ? "Final Trials & Samagri" : idx === 4 ? "Dry Run & Logistics" : "Main Rituals & Feast",
            description: `Key milestone execution counting backward from ${date}.`,
            targetMilestoneDays: safeM.actualDaysBefore,
            milestoneDate: safeM.dateStr,
            priority: idx === 0 ? "high" : idx === 4 || idx === 5 ? "urgent" : "medium",
            isUrgent: idx === 5,
            category: idx === 1 ? "Ritual / Pooja" : "Logistics",
          },
        ],
      };
    });
  }

  // Budget breakdown calculation - strictly 5% to 10% contingency (7% chosen)
  const contingencyPercent = 7;
  const contingencyAmt = Math.round(budgetINR * (contingencyPercent / 100));

  let budgetBreakdownItems: any[] = [];
  let cateringAmt = 0;
  let venueAmt = 0;
  let decorAmt = 0;
  let photoAmt = 0;
  let attireAmt = 0;
  let ritualAmt = 0;
  let giftsAmt = 0;

  if (isTightBudget) {
    // Tight budget breakdown: Prioritizing core essentials (Food 45%, Venue 18%, Decor 10%, Photo 7%, Attire 6%, Rituals 4%, Gifts 3%, Contingency 7%)
    cateringAmt = Math.round(budgetINR * 0.45);
    venueAmt = Math.round(budgetINR * 0.18);
    decorAmt = Math.round(budgetINR * 0.10);
    photoAmt = Math.round(budgetINR * 0.07);
    attireAmt = Math.round(budgetINR * 0.06);
    ritualAmt = Math.round(budgetINR * 0.04);
    giftsAmt = Math.round(budgetINR * 0.03);

    budgetBreakdownItems = [
      {
        id: "b_catering",
        category: "Catering & Authentic Feast (Essential Focus)",
        percent: 45,
        amountINR: cateringAmt,
        description: `Wholesome, delicious regional feast for ${guestCount} guests focusing on crowd-pleaser staples (dal makhani/sambhar, paneer/poori, hot gulab jamun/jalebi).`,
        costSavingTip: `Choose a rich single-cuisine thali/buffet instead of multiple live chaat counters. Partner directly with a local halwai for sweets.`,
      },
      {
        id: "b_venue",
        category: "Community Hall / Society Venue",
        percent: 18,
        amountINR: venueAmt,
        description: `Functional air-cooled community hall, residential society clubhouse, or temple hall in ${city} with adequate seating and dining area.`,
        costSavingTip: `Book municipal or community trust halls that charge 40-60% less than commercial banquet lawns.`,
      },
      {
        id: "b_decor",
        category: "Wholesale Marigold & Toran Decor",
        percent: 10,
        amountINR: decorAmt,
        description: "100% fresh orange and yellow marigold (genda phool) strings, brass urlis with floating candles, and traditional entrance toran.",
        costSavingTip: `Buy loose flower sacks directly from local wholesale flower mandis at dawn; assemble simple marigold curtains with family help.`,
      },
      {
        id: "b_photo",
        category: "Solo Photographer & Portrait Highlights",
        percent: 7,
        amountINR: photoAmt,
        description: "Talented solo candid photographer covering core rituals, stage portraits, and high-resolution digital album.",
        costSavingTip: "Hire a passionate freelance photographer or final-year visual arts student for high-quality candid work without agency fees.",
      },
      {
        id: "b_attire",
        category: "Traditional Attire & Self Styling",
        percent: 6,
        amountINR: attireAmt,
        description: "Festive Indian attire, elegant drapes, traditional accessories, and self-styling with family assistance.",
        costSavingTip: "Explore designer rental boutiques for high-end lehengas or sherwanis, or restyle treasured heirloom family silks.",
      },
      {
        id: "b_rituals",
        category: "Panditji Dakshina & Sacred Puja Samagri",
        percent: 4,
        amountINR: ritualAmt,
        description: "Desi ghee, coconuts, betel leaves, hawan samagri, and respectful dakshina for the Vedic officiant.",
        costSavingTip: "Buy complete pre-packaged hawan kits directly from wholesale temple bazaar supply stores.",
      },
      {
        id: "b_gifts",
        category: "Digital Invites & Traditional Prasad Favors",
        percent: 3,
        amountINR: giftsAmt,
        description: `Animated WhatsApp digital invitation cards and modest sacred prasad / dry-fruit pouches for departing guests.`,
        costSavingTip: "Replace printed paper card boxes with personalized Canva WhatsApp video cards (₹0 printing cost).",
      },
      {
        id: "b_contingency",
        category: "Contingency & Emergency Reserve (7%)",
        percent: contingencyPercent,
        amountINR: contingencyAmt,
        description: "Essential 7% buffer (within mandatory 5-10% range) reserved for last-minute plate additions, transport, and unexpected ritual requirements.",
        costSavingTip: "Keep this reserve untouched until event day for sudden extra guests or instant UPI payments.",
      },
    ];
  } else {
    // Standard budget allocation (Total: 100%, Contingency: 7%)
    cateringAmt = Math.round(budgetINR * 0.35);
    venueAmt = Math.round(budgetINR * 0.21);
    decorAmt = Math.round(budgetINR * 0.13);
    photoAmt = Math.round(budgetINR * 0.09);
    attireAmt = Math.round(budgetINR * 0.08);
    ritualAmt = Math.round(budgetINR * 0.04);
    giftsAmt = Math.round(budgetINR * 0.03);

    budgetBreakdownItems = [
      {
        id: "b_catering",
        category: "Catering, Mithai & Live Food Counters",
        percent: 35,
        amountINR: cateringAmt,
        description: `Sumptuous multi-course feast with authentic regional delicacies, live chaat stalls, and fresh Indian sweets for ${guestCount} guests.`,
        costSavingTip: `Partner directly with a reputed local halwai for sweet boxes instead of venue package markups to save 20-30%.`,
      },
      {
        id: "b_venue",
        category: "Banquet Hall, Lawn & Facilities",
        percent: 21,
        amountINR: venueAmt,
        description: `Well-appointed air-conditioned hall with ample guest parking, dedicated green rooms, generator backup, and clean washroom facilities.`,
        costSavingTip: `Inquire about non-muhurat morning or afternoon slots, which venues often discount by 15-25%.`,
      },
      {
        id: "b_decor",
        category: "Mandap, Floral Torans & Ambient Lighting",
        percent: 13,
        amountINR: decorAmt,
        description: "Auspicious marigold (genda phool) entrance arches, brass urlis with floating diyas, fragrant tuberose (rajnigandha), and stage lighting.",
        costSavingTip: `Source seasonal genda phool directly from local wholesale flower mandis (like Phool Mandi or Dadar market) at wholesale rates.`,
      },
      {
        id: "b_photo",
        category: "Photography, Cinematography & Drone",
        percent: 9,
        amountINR: photoAmt,
        description: "Comprehensive capture of traditional rituals, candid family smiles, traditional portraits, and an edited celebratory cinematic teaser.",
        costSavingTip: "Book a single unified photo-video team rather than two separate agencies to avoid double equipment charges.",
      },
      {
        id: "b_attire",
        category: "Traditional Attire, Safas & Styling",
        percent: 8,
        amountINR: attireAmt,
        description: "Curated Indian celebration attire, matching safas / stoles for host family, and hair/makeup artist styling.",
        costSavingTip: "Consider premium designer rental boutiques for heavy sherwanis/lehengas that are only worn once.",
      },
      {
        id: "b_rituals",
        category: "Panditji Dakshina & Vedic Puja Samagri",
        percent: 4,
        amountINR: ritualAmt,
        description: "Hawan wood, desi ghee, kalash, coconut, betel leaves, fresh flower garlands, and respectful dakshina for the Vedic officiant.",
        costSavingTip: "Purchase complete puja samagri kits in bulk from trusted temple supply shops rather than ad-hoc retail purchases.",
      },
      {
        id: "b_gifts",
        category: "Shagun Lifafas, Mithai & Return Gifts",
        percent: 3,
        amountINR: giftsAmt,
        description: `Heartfelt return favors, dry fruit potlis, and personalized mementos to honor the principle of 'Atithi Devo Bhava'.`,
        costSavingTip: "Curate reusable brass diyas or seed-paper calendars with dry fruit potlis bought from dry-fruit wholesale markets.",
      },
      {
        id: "b_contingency",
        category: "Contingency & Hospitality Buffer (7%)",
        percent: contingencyPercent,
        amountINR: contingencyAmt,
        description: "Protected 7% contingency reserve (strictly within mandatory 5-10% range) safeguarding against unexpected plate surges or last-minute needs.",
        costSavingTip: "Keep this liquid reserve untouched for on-the-spot vendor gratuity and overtime buffer.",
      },
    ];
  }

  return {
    todayDate: todayStr,
    daysUntilEvent,
    isTimelineCompressed: isCompressed,
    isTightBudget: !!isTightBudget,
    eventSummary: {
      title: isTightBudget ? `Smart Economy ${eventType}` : `Grand ${eventType} Celebration`,
      tagline: isTightBudget
        ? `A streamlined celebration focused on core Vedic rituals, wholesome feast, and cost-efficient elegance in ${city}`
        : `A harmonious cultural confluence of Vedic traditions, lavish feast, and joyful memories in ${city}`,
      auspiciousNote: `May this auspicious celebration bring enduring prosperity, radiant health, and divine blessings to your family. (Shubham Bhavatu)`,
      estimatedTotalBudget: budgetINR,
      perGuestBudget: Math.round(budgetINR / guestCount),
      contingencyFund: contingencyAmt,
      cityContext: `Tailored for ${city}'s event venues, local wholesale mandis, and seasonal trends.`,
    },
    budgetBreakdown: budgetBreakdownItems,
    reverseTimeline: timelinePhases,
    vendorChecklist: [
      {
        id: "v_caterer",
        vendorRole: "Authentic Regional Caterer & Live Counter Chef",
        importance: "Crucial",
        targetHireTimeline: isCompressed ? "Book Immediately (Day 1)" : "Book 3 months ahead",
        averageEstimatedCostINR: cateringAmt,
        typicalDeliverables: "Full banquet buffet, welcome drinks (thandai/fresh lime), 3 live stalls, dessert bar, tableware & service staff.",
        questionsToAsk: [
          "Do you include live counter chefs in the per-plate cost?",
          "Can you accommodate strict Jain/pure-veg separate prep areas?",
          "What is your grace period buffer if guest turnout exceeds RSVP by 10%?",
        ],
      },
      {
        id: "v_pandit",
        vendorRole: "Vedic Panditji / Cultural Officiant",
        importance: "Crucial",
        targetHireTimeline: isCompressed ? "Lock within 48 hours" : "Book 2 months ahead",
        averageEstimatedCostINR: Math.round(ritualAmt * 0.7),
        typicalDeliverables: "Vedic mantras, hawan ceremony, muhurat timing guidance, samagri verification, and personalized family blessings.",
        questionsToAsk: [
          "What is the exact shubh muhurat window for our main ritual?",
          "Will you provide a printed samagri list in advance?",
          "Are assistant brahmins included for larger hawan arrangements?",
        ],
      },
      {
        id: "v_decorator",
        vendorRole: "Marigold, Floral & Lighting Decorator",
        importance: "High",
        targetHireTimeline: isCompressed ? "Book this week" : "Book 6 weeks ahead",
        averageEstimatedCostINR: decorAmt,
        typicalDeliverables: "Floral entrance toran, stage backdrop, mandap canopy, warm ambient fairy lights, and seating covers.",
        questionsToAsk: [
          "Are all flowers guaranteed fresh morning-harvested blooms?",
          "Does your quote include complete post-event teardown and disposal?",
          "Can you incorporate traditional brass urlis with floating flowers?",
        ],
      },
      {
        id: "v_photo",
        vendorRole: "Cinematographer & Candid Photographer",
        importance: "High",
        targetHireTimeline: isCompressed ? "Book this week" : "Book 2 months ahead",
        averageEstimatedCostINR: photoAmt,
        typicalDeliverables: "Traditional posed family photos, candid moments, 4K video reel, edited photo album, and raw footage drive.",
        questionsToAsk: [
          "How many shooters will be on-site simultaneously?",
          "What is the turnaround time for social media teaser reels vs full album?",
          "Do you bring your own lighting and wireless audio mics for the pooja?",
        ],
      },
      {
        id: "v_music",
        vendorRole: "Dhol Tasha / Shehnai / Sound Engineer",
        importance: "Recommended",
        targetHireTimeline: isCompressed ? "Book next week" : "Book 1 month ahead",
        averageEstimatedCostINR: Math.round(budgetINR * 0.05),
        typicalDeliverables: "Traditional shehnai/nagada entrance music, wireless cordless mics for speeches, festive background playlist.",
        questionsToAsk: [
          `Are you familiar with ${city}'s 10 PM sound volume guidelines?`,
          "Do you have a backup amplifier and generator connection?",
        ],
      },
    ],
    personalizedTraditions: [
      {
        id: "t_1",
        title: "Auspicious Genda Phool & Brass Urli Welcome",
        ritualContext: "In Vedic symbolism, marigold (genda) represents the divine golden sun, welcoming prosperity and warding off negative energies.",
        howToExecute: "Arrange 3 antique brass urlis filled with water, floating yellow and orange marigold petals, and scented tea-light candles at the main entry walkway.",
        approximateCostLevel: "Budget-friendly",
        culturalHighlight: "Invokes positive divine vibrations (Shubh Spandana) upon arrival",
      },
      {
        id: "t_2",
        title: "Traditional Tilak, Chandan & Rose-Water Welcome",
        ritualContext: "The ancient Indian hospitality principle of 'Atithi Devo Bhava' treats every arriving guest as an embodiment of the divine.",
        howToExecute: "Assign two smiling family members dressed in traditional attire to greet guests with fragrant sandalwood paste, rice grains (akshat), and a gentle rose water mist.",
        approximateCostLevel: "Budget-friendly",
        culturalHighlight: "Culturally warms hearts and establishes a joyful festive tone",
      },
      {
        id: "t_3",
        title: "Sankalp & Maha Aarti with Consecrated Coconut",
        ritualContext: "Commencing the core celebration with a collective prayer ensures the removal of all obstacles (Vighnaharta).",
        howToExecute: "Gather close family for a 15-minute unified prayer and aarti, with bronze bells and camphor flame passed to all present.",
        approximateCostLevel: "Budget-friendly",
        culturalHighlight: "Unites elders and younger generations in shared reverence",
      },
      {
        id: "t_4",
        title: "Interactive Live Chaat & Kulhad Chai Counter",
        ritualContext: "Food is revered as 'Annam Parabrahma Swaroopam' — nourishing the soul through culinary delights.",
        howToExecute: "Set up a street-style station serving fresh pani puri, dahi bhalla, and hot cardamom tea in terracotta kulhads that guests can enjoy while socializing.",
        approximateCostLevel: "Moderate",
        culturalHighlight: "Brings immense cheer, authentic nostalgic street flavors, and animated conversation",
      },
      {
        id: "t_5",
        title: "Shagun Return Favors with Handcrafted Mithai & Sacred Tulsi",
        ritualContext: "Presenting return gifts (Prasad / Shagun) ensures guests depart carrying the auspicious goodwill of the host family.",
        howToExecute: "Offer each departing family a silk potli pouch containing rich dry fruits, a miniature silver coin or brass diya, and a message of gratitude.",
        approximateCostLevel: "Moderate",
        culturalHighlight: "Leaves an indelible impression of royal Indian generosity and grace",
      },
    ],
    culturalTipsAndAdvice: [
      `Check ${city}'s local municipal guidelines regarding outdoor amplified music (typically strictly regulated after 10:00 PM).`,
      `Account for ${city}'s rush-hour traffic when coordinating vendor arrival times; request all caterers and decorators to arrive 3 hours prior to guest arrival.`,
      `Designate one family member as the official 'Dakshina & Vendor Coordinator' so financial disbursements are seamless during rituals without interrupting the hosts.`,
      `Keep a dedicated hospitality station with bottled mineral water, digestive fennel (saunf/mukhwas), and emergency pain-relief balm for elderly guests.`,
    ],
  };
}

// API Endpoint to generate complete event plan
app.post("/api/plan/generate", async (req, res) => {
  try {
    const { eventType, date, city, guestCount, budgetINR, customsNotes, todayDate: clientTodayDate, isTightBudget } = req.body;

    // Server-side validation
    if (!eventType || typeof eventType !== "string") {
      return res.status(400).json({ error: "Event type is required." });
    }
    if (!date || typeof date !== "string") {
      return res.status(400).json({ error: "Event date is required." });
    }
    if (!city || typeof city !== "string") {
      return res.status(400).json({ error: "City is required." });
    }
    const guests = Number(guestCount);
    if (isNaN(guests) || guests <= 0) {
      return res.status(400).json({ error: "Guest count must be a positive number." });
    }
    const budget = Number(budgetINR);
    if (isNaN(budget) || budget <= 0) {
      return res.status(400).json({ error: "Budget in INR must be a positive amount." });
    }

    // Determine current real-world date
    const todayStr = (clientTodayDate && typeof clientTodayDate === "string")
      ? clientTodayDate
      : new Date().toISOString().split("T")[0];

    const todayObj = new Date(todayStr);
    const eventObj = new Date(date);
    todayObj.setHours(0, 0, 0, 0);
    eventObj.setHours(0, 0, 0, 0);

    const diffTime = eventObj.getTime() - todayObj.getTime();
    const daysUntilEvent = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysUntilEvent < 0) {
      return res.status(400).json({ error: "Event date cannot be in the past." });
    }

    const isCompressed = daysUntilEvent < 90; // Less than 3 months away

    // Budget Reality Check computation
    const perGuestBudget = Math.round(budget / guests);
    const isEconomyBudget = Boolean(
      isTightBudget ||
      (perGuestBudget < 1500 && eventType.toLowerCase().includes("wedding")) ||
      (perGuestBudget < 500 && eventType.toLowerCase().includes("birthday")) ||
      (perGuestBudget < 250)
    );

    const contingencyMin = Math.round(budget * 0.05);
    const contingencyMax = Math.round(budget * 0.10);
    const recommendedContingency = Math.round(budget * 0.07);

    const ai = getAiClient();
    if (!ai) {
      // If no key configured, return high-fidelity curated plan directly
      const plan = generateCuratedIndianEventPlan({
        eventType,
        date,
        city,
        guestCount: guests,
        budgetINR: budget,
        customsNotes,
        todayStr,
        daysUntilEvent,
        isCompressed,
        isTightBudget: isEconomyBudget,
      });
      return res.json(plan);
    }

    const prompt = `You are an expert Indian celebration and event planning specialist (Wedding Planner, Event Director, and Vedic Muhurat advisor) with deep familiarity with Indian traditions, regional cultural nuances, vendor pricing in ${city}, and Indian hospitality ('Atithi Devo Bhava').

EVENT DETAILS & BUDGET REALITY:
- Event Type: ${eventType}
- Target Event Date: ${date}
- City: ${city}, India
- Guest Count: ${guests} people
- Total Budget: ₹${budget.toLocaleString("en-IN")} INR (₹${perGuestBudget.toLocaleString("en-IN")} per guest)
${customsNotes ? `- Specific Preferences/Traditions: ${customsNotes}` : ""}

${
  isEconomyBudget
    ? `⚠️ TIGHT / ECONOMY BUDGET STRATEGY:
- At ₹${perGuestBudget.toLocaleString("en-IN")}/guest, this is a tight budget for a ${eventType}.
- PRIORITIZE ESSENTIALS:
  1. Catering: Wholesome, delicious regional single-cuisine buffet or satvik thali (e.g. dal makhani, paneer/puri, gulab jamun) instead of multi-counter spreads.
  2. Venue: Focus on functional community halls, society clubhouses, or temple halls in ${city} rather than luxury hotel lawns.
  3. Decor: Focus strictly on fresh yellow/orange marigold (genda phool) strings and warm fairy lights bought from local flower mandis; avoid expensive imported exotic flowers or heavy fiberglass mandaps.
  4. Photo & Music: Recommend a single versatile candid photographer / student freelancer over multi-crew teams.
  5. Invitations: Emphasize WhatsApp animated video cards and digital RSVPs (₹0 printing).
- COST SAVINGS: In every category's 'costSavingTip', provide practical, street-smart Indian market hacks.
- CONTINGENCY BUFFER RULE: Keep 'contingencyFund' strictly between 5% and 10% of total budget (between ₹${contingencyMin.toLocaleString("en-IN")} and ₹${contingencyMax.toLocaleString("en-IN")}, recommended ~7%: ₹${recommendedContingency.toLocaleString("en-IN")}).`
    : `BUDGET ALLOCATION & CONTINGENCY:
- Allocate realistic percentages across banquet venue, authentic catering, decor, and entertainment.
- CONTINGENCY BUFFER RULE: Keep 'contingencyFund' strictly between 5% and 10% of total budget (between ₹${contingencyMin.toLocaleString("en-IN")} and ₹${contingencyMax.toLocaleString("en-IN")}, recommended ~7%: ₹${recommendedContingency.toLocaleString("en-IN")}).`
}

TIMELINE REQUIREMENTS & RULES:
1. TODAY'S REAL DATE: ${todayStr}.
2. EVENT DATE: ${date}.
3. EXACT DAYS REMAINING: ${daysUntilEvent} days (approx ${Math.ceil(daysUntilEvent / 7)} weeks).
4. STRICT REVERSE TIMELINE: Every milestone must count backwards from the event date (${date}).
5. CRITICAL: NEVER output any milestone date or timeframe in the past (before ${todayStr})! Every single milestoneDate must be on or after ${todayStr}.
${
  isCompressed
    ? `6. TIME COMPRESSION ACTIVE (< 3 MONTHS):
- The event is in ONLY ${daysUntilEvent} days (less than 3 months away)!
- You MUST COMPRESS and accelerate the entire reverse timeline into the available ${Math.ceil(daysUntilEvent / 7)} weeks between ${todayStr} and ${date}.
- Do NOT output generic long-range milestones like '6 months before' or '4 months before' because those dates have ALREADY PASSED!
- Divide the timeline into immediate fast-track weekly milestones (e.g., 'Immediate Sprint (Starting Today ${todayStr})', 'Phase 2: 4 Weeks Before', 'Phase 3: 2 Weeks Before', 'Phase 4: Final Week', 'Phase 5: 3 Days Before', 'Phase 6: Event Day & Next Day').
- Consolidate critical long-lead tasks (locking banquet venue, booking caterer and halwai, securing Panditji for Muhurat, sending digital save-the-dates) into Phase 1 with isUrgent: true and priority: 'urgent'.
- Clearly mark all time-critical tasks with isUrgent: true.`
    : `6. STANDARD TIMELINE (${daysUntilEvent} days away):
- Distribute phases backwards from ${date} across the available months/weeks.
- Ensure no milestone date is earlier than ${todayStr}.`
}

Ensure the output contains:
1. eventSummary: Auspicious blessing / Muhurat note, per-guest budget, contingency fund, and city context.
2. budgetBreakdown: INR categories matching the total ₹${budget}, with practical Indian market cost-saving tips.
3. reverseTimeline: Milestone phases counting back from ${date}. For every task, specify:
   - targetMilestoneDays: number of days counting back from ${date}. Must be <= ${daysUntilEvent}.
   - milestoneDate: 'YYYY-MM-DD' representing (eventDate - targetMilestoneDays). MUST be >= ${todayStr} and <= ${date}.
   - isUrgent: boolean (true for urgent tasks).
   - priority: 'urgent', 'high', 'medium', or 'normal'.
4. vendorChecklist: Essential Indian vendors (Caterer with regional menu & live counters, Panditji/officiant, Mehendi artist, Marigold decorator, Photo/Video, DJ/Dhol Tasha, Venue manager, Bridal MUA, Invitations/Mithai boxes) with estimated rates in INR, questions to ask, and deliverables.
5. personalizedTraditions: Exactly 5 personalized Indian traditions tailored to ${eventType} (e.g., Haldi, Sangeet choreo with dhol, Ganesh Pooja, Shagun potlis, live chaat stalls).
6. culturalTipsAndAdvice: 4-6 practical tips for ${city} (weather/monsoon, 10 PM sound curfew, guest hospitality).`;

    // Attempt Gemini call with safe handling for temporary spikes
    try {
      const generatePromise = ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              eventSummary: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  tagline: { type: Type.STRING },
                  auspiciousNote: { type: Type.STRING },
                  estimatedTotalBudget: { type: Type.NUMBER },
                  perGuestBudget: { type: Type.NUMBER },
                  contingencyFund: { type: Type.NUMBER },
                  cityContext: { type: Type.STRING },
                },
                required: ["title", "tagline", "auspiciousNote", "estimatedTotalBudget", "perGuestBudget", "contingencyFund", "cityContext"],
              },
              budgetBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    category: { type: Type.STRING },
                    percent: { type: Type.NUMBER },
                    amountINR: { type: Type.NUMBER },
                    description: { type: Type.STRING },
                    costSavingTip: { type: Type.STRING },
                  },
                  required: ["id", "category", "percent", "amountINR", "description", "costSavingTip"],
                },
              },
              reverseTimeline: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phaseId: { type: Type.STRING },
                    timeframe: { type: Type.STRING },
                    daysBeforeEvent: { type: Type.NUMBER },
                    milestoneDate: { type: Type.STRING },
                    isCompressed: { type: Type.BOOLEAN },
                    tasks: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          targetMilestoneDays: { type: Type.NUMBER },
                          milestoneDate: { type: Type.STRING },
                          priority: { type: Type.STRING },
                          isUrgent: { type: Type.BOOLEAN },
                          category: { type: Type.STRING },
                        },
                        required: ["id", "title", "description", "targetMilestoneDays", "milestoneDate", "priority", "category"],
                      },
                    },
                  },
                  required: ["phaseId", "timeframe", "tasks"],
                },
              },
              vendorChecklist: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    vendorRole: { type: Type.STRING },
                    importance: { type: Type.STRING },
                    targetHireTimeline: { type: Type.STRING },
                    averageEstimatedCostINR: { type: Type.NUMBER },
                    typicalDeliverables: { type: Type.STRING },
                    questionsToAsk: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["id", "vendorRole", "importance", "targetHireTimeline", "averageEstimatedCostINR", "typicalDeliverables", "questionsToAsk"],
                },
              },
              personalizedTraditions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    ritualContext: { type: Type.STRING },
                    howToExecute: { type: Type.STRING },
                    approximateCostLevel: { type: Type.STRING },
                    culturalHighlight: { type: Type.STRING },
                  },
                  required: ["id", "title", "ritualContext", "howToExecute", "approximateCostLevel", "culturalHighlight"],
                },
              },
              culturalTipsAndAdvice: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              "eventSummary",
              "budgetBreakdown",
              "reverseTimeline",
              "vendorChecklist",
              "personalizedTraditions",
              "culturalTipsAndAdvice",
            ],
          },
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini generation timed out after 15s")), 15000)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const textOutput = response.text;
      if (!textOutput) {
        throw new Error("No response content generated by Gemini.");
      }

      const parsedData = JSON.parse(textOutput);

      // Programmatic enforcement: Guarantee no dates in the past
      const sanitizedTimeline = parsedData.reverseTimeline.map((phase: any, pIdx: number) => {
        const rawPhaseDays = typeof phase.daysBeforeEvent === "number"
          ? phase.daysBeforeEvent
          : (phase.tasks[0]?.targetMilestoneDays || 0);

        const safePhase = computeSafeMilestoneDate(date, rawPhaseDays, todayStr);

        const sanitizedTasks = phase.tasks.map((task: any, tIdx: number) => {
          const rawTaskDays = typeof task.targetMilestoneDays === "number" ? task.targetMilestoneDays : rawPhaseDays;
          const safeTask = computeSafeMilestoneDate(date, rawTaskDays, todayStr);

          const daysFromToday = Math.max(
            0,
            Math.ceil((new Date(safeTask.dateStr).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24))
          );

          const shouldBeUrgent =
            task.isUrgent === true ||
            task.priority?.toLowerCase() === "urgent" ||
            safeTask.wasClamped ||
            (isCompressed && daysFromToday <= 7);

          return {
            ...task,
            id: task.id || `task_${pIdx}_${tIdx}`,
            targetMilestoneDays: safeTask.actualDaysBefore,
            daysBeforeEvent: safeTask.actualDaysBefore,
            milestoneDate: safeTask.dateStr,
            isUrgent: shouldBeUrgent,
            priority: shouldBeUrgent ? "urgent" : (task.priority || "medium"),
          };
        });

        return {
          ...phase,
          phaseId: phase.phaseId || `phase_${pIdx}`,
          daysBeforeEvent: safePhase.actualDaysBefore,
          milestoneDate: safePhase.dateStr,
          isCompressed: isCompressed || phase.isCompressed,
          tasks: sanitizedTasks,
        };
      });

      parsedData.reverseTimeline = sanitizedTimeline;
      parsedData.todayDate = todayStr;
      parsedData.daysUntilEvent = daysUntilEvent;
      parsedData.isTimelineCompressed = isCompressed;
      parsedData.isTightBudget = isEconomyBudget;

      // Enforce 5% to 10% contingency buffer rule
      const safeContingency = Math.min(
        contingencyMax,
        Math.max(contingencyMin, parsedData.eventSummary?.contingencyFund || recommendedContingency)
      );
      if (parsedData.eventSummary) {
        parsedData.eventSummary.contingencyFund = safeContingency;
      }

      return res.json(parsedData);
    } catch (apiError: any) {
      console.warn("Gemini API spike/error encountered, activating curated planner:", apiError?.message);
      // Fallback to high-fidelity curated planner
      const plan = generateCuratedIndianEventPlan({
        eventType,
        date,
        city,
        guestCount: guests,
        budgetINR: budget,
        customsNotes,
        todayStr,
        daysUntilEvent,
        isCompressed,
        isTightBudget: isEconomyBudget,
      });
      return res.json(plan);
    }
  } catch (error: any) {
    console.error("Plan generation error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate event plan. Please check inputs and try again.",
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Celebration & Event Planner server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
