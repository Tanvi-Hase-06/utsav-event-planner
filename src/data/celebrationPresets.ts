export interface EventPreset {
  id: string;
  name: string;
  badge: string;
  eventType: string;
  city: string;
  guestCount: number;
  budgetINR: number;
  customsNotes: string;
  iconName: string;
  description: string;
}

export const INDIAN_CITIES = [
  "Mumbai",
  "Delhi NCR",
  "Bengaluru",
  "Jaipur",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Lucknow",
  "Goa",
  "Udaipur",
  "Chandigarh",
  "Indore",
  "Surat",
  "Kochi",
  "Varanasi",
  "Nagpur",
  "Amritsar",
  "Bhopal",
  "Vadodara",
  "Coimbatore",
  "Visakhapatnam",
  "Patna",
];

export const EVENT_TYPES = [
  "Wedding / Grand Shaadi (Multi-Day)",
  "Haldi & Mehendi Celebration",
  "Sangeet & Cocktail Night",
  "Birthday Party (Janamdin / Milestone)",
  "Community Festival (Ganesh Utsav / Diwali / Navratri)",
  "Pooja / Satyanarayan / Griha Pravesh",
  "Engagement Ceremony (Roka / Sagai)",
  "Baby Shower (Godh Bharai / Seemantham)",
  "Anniversary / Silver Jubilee",
  "Retirement / Shashti Poorthi (60th)",
  "Corporate / Cultural Gala",
  "Other Celebration",
];

export const BUDGET_SHORTCUTS = [
  { label: "₹1.5 Lakh", value: 150000, tag: "Intimate" },
  { label: "₹3 Lakh", value: 300000, tag: "Budget" },
  { label: "₹6 Lakh", value: 600000, tag: "Popular" },
  { label: "₹12 Lakh", value: 1200000, tag: "Grand" },
  { label: "₹25 Lakh", value: 2500000, tag: "Royal" },
  { label: "₹50 Lakh", value: 5000000, tag: "Luxury" },
  { label: "₹1 Crore", value: 10000000, tag: "Extravagant" },
];

export const GUEST_SHORTCUTS = [
  { label: "50 Guests", value: 50, desc: "Close Family" },
  { label: "100 Guests", value: 100, desc: "Medium" },
  { label: "250 Guests", value: 250, desc: "Traditional" },
  { label: "500 Guests", value: 500, desc: "Grand" },
  { label: "800+ Guests", value: 800, desc: "Mega Indian Gathering" },
];

export const SAMPLE_PRESETS: EventPreset[] = [
  {
    id: "royal-jaipur-wedding",
    name: "Royal Heritage Wedding & Sangeet",
    badge: "Most Popular",
    eventType: "Wedding / Grand Shaadi (Multi-Day)",
    city: "Jaipur",
    guestCount: 350,
    budgetINR: 2500000,
    customsNotes: "Marigold floral decor, live shehnai & nagada welcome, North Indian + Rajasthani dal baati thali, sangeet choreo dance night.",
    iconName: "Crown",
    description: "Multi-day palace vibe wedding with regal hospitality and authentic royal flavors.",
  },
  {
    id: "vibrant-mumbai-sangeet-haldi",
    name: "Vibrant Haldi & Sangeet Weekend",
    badge: "High Energy",
    eventType: "Haldi & Mehendi Celebration",
    city: "Mumbai",
    guestCount: 150,
    budgetINR: 750000,
    customsNotes: "Yellow dress code, brass urlis with flower petals for haldi, live chaat stalls, Bollywood DJ & Punjabi dhol.",
    iconName: "Sparkles",
    description: "Floral splash haldi celebration followed by high-octane Bollywood sangeet.",
  },
  {
    id: "ganesh-utsav-community",
    name: "Ganesh Utsav & Satyanarayan Pooja",
    badge: "Devotional",
    eventType: "Community Festival (Ganesh Utsav / Diwali / Navratri)",
    city: "Pune",
    guestCount: 250,
    budgetINR: 350000,
    customsNotes: "Eco-friendly clay idol, traditional Puneri dhol tasha mandal, ukadiche modak live distribution, traditional aarti.",
    iconName: "Flame",
    description: "Community festival celebration honoring Lord Ganesha with authentic Maharashtrian hospitality.",
  },
  {
    id: "milestone-1st-birthday",
    name: "Royal 1st Birthday / Janamdin",
    badge: "Family Fun",
    eventType: "Birthday Party (Janamdin / Milestone)",
    city: "Bengaluru",
    guestCount: 90,
    budgetINR: 200000,
    customsNotes: "Jungle / Royal prince theme, live kids magic show, cotton candy & balloon artists, photo booth with instant prints.",
    iconName: "PartyPopper",
    description: "Joyful milestone 1st birthday packed with treats, entertainment, and photo memories.",
  },
  {
    id: "traditional-griha-pravesh",
    name: "Shubh Griha Pravesh & Feast",
    badge: "Auspicious",
    eventType: "Pooja / Satyanarayan / Griha Pravesh",
    city: "Delhi NCR",
    guestCount: 75,
    budgetINR: 180000,
    customsNotes: "Vedic Vastu hawan pooja, rangoli at entrance, pure vegetarian satvik feast with desi ghee sweets, silver coin return gifts.",
    iconName: "Home",
    description: "Sacred housewarming ceremony followed by an auspicious community feast.",
  },
];

export const FESTIVE_LOADING_TIPS = [
  "In Indian traditions, distributing Mithai (sweets) marks the beginning of auspicious beginnings — Shubh Aarambh!",
  "Genda Phool (Marigold) symbolises the sun, energy, and purity in Hindu rituals, making it the supreme flower for mandaps.",
  "Did you know? Booking flowers early morning directly from local flower mandis (like Dadar or Ghazipur) saves up to 45% on decor!",
  "Shehnai melodies at the entrance are believed to invoke positive cosmic vibrations and welcome deities.",
  "Haldi (turmeric) paste applied before weddings acts as natural skin glow, antiseptic, and wards off the evil eye (Buri Nazar).",
  "Planning live counters (like Chaat, Dosa, Jalebi-Rabdi) delights guests far more than a static buffet!",
];
