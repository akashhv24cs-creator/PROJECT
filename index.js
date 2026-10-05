export const BRAND = {
  name: "Zenera Trips",
  tagline: "Chalo Kahi Bhi.",
  colors: {
    navy: "#0F172A",
    charcoal: "#0F172A",
    orange: "#FF6A00",
    orangeLight: "#FF7A1A",
    warmWhite: "#FFFBF7",
    cream: "#FFFBF7",
    softGray: "#F5F7FA",
    slate: "#64748B",
    white: "#FFFFFF",
    dark: "#07111F",
  },
  fonts: {
    heading: "Syne",
    body: "Inter",
  },
};

export const LINKS = {
  whatsapp: "https://wa.me/919353739983",
  playStore: "https://play.google.com/store",
  appStore: null,
};

export const VEHICLES = [
  { id: "dzire",           name: "Swift Dzire / Etios", vehicleType: "Sedan",          category: "sedan", seats: "4 seats",     price: "₹11/km", icon: "🚗", tag: null },
  { id: "ertiga",          name: "Maruti Ertiga",       vehicleType: "Ertiga",         category: "suv",   seats: "6–7 seats",   price: "₹12/km", icon: "🚙", tag: null },
  { id: "innova-crysta",   name: "Toyota Innova Crysta", vehicleType: "Innova Crysta", category: "suv",   seats: "7 seats",     price: "₹16/km", icon: "🚐", tag: "Premium" },
  { id: "tempo-traveller", name: "Tempo Traveller",     vehicleType: "Tempo Traveller", category: "tempo", seats: "12–17 seats", price: "₹15/km", icon: "🚌", tag: "Most Popular" },
  { id: "mini-bus",        name: "Mini Bus",            vehicleType: "Mini Bus",       category: "bus",   seats: "20–35 seats", price: "₹22/km", icon: "🚍", tag: null },
  { id: "luxury-bus",      name: "Luxury Bus",          vehicleType: "Bus",            category: "bus",   seats: "40+ seats",   price: "₹30/km", icon: "🚎", tag: null },
];

export const ROUTES = [
  {
    from: "Bangalore", to: "Tirupati", distance: "280 km", duration: "~5 hrs",
    onTheWay: ["Vellore", "Chittor", "Srikalahasti"],
    atDestination: ["Tirumala Temple", "Padmavathi Temple", "Kapila Theertham"],
    tag: "Pilgrimage Route",
  },
  {
    from: "Bangalore", to: "Coorg", distance: "250 km", duration: "~4.5 hrs",
    onTheWay: ["Mysore", "Kushalnagar", "Bylakuppe"],
    atDestination: ["Abbey Falls", "Raja's Seat", "Nagarhole"],
    tag: "Weekend Getaway",
  },
  {
    from: "Bangalore", to: "Gokarna", distance: "480 km", duration: "~8 hrs",
    onTheWay: ["Hubli", "Sirsi", "Ankola"],
    atDestination: ["Om Beach", "Mahabaleshwar Temple", "Kudle Beach"],
    tag: "Coastal Circuit",
  },
  {
    from: "Bangalore", to: "Ooty", distance: "270 km", duration: "~5 hrs",
    onTheWay: ["Mysore", "Gudalur", "Masinagudi"],
    atDestination: ["Botanical Garden", "Doddabetta Peak", "Pykara Lake"],
    tag: "Hill Station",
  },
  {
    from: "Bangalore", to: "Hampi", distance: "350 km", duration: "~6 hrs",
    onTheWay: ["Tumkur", "Chitradurga", "Hospet"],
    atDestination: ["Virupaksha Temple", "Vittala Temple", "Elephant Stables"],
    tag: "Heritage Trail",
  },
  {
    from: "Bangalore", to: "Kanyakumari", distance: "700 km", duration: "~11 hrs",
    onTheWay: ["Salem", "Coimbatore", "Nagercoil"],
    atDestination: ["Vivekananda Rock", "Thiruvalluvar Statue", "Sunset Point"],
    tag: "Long Distance",
  },
];

export const STATS = [
  { number: "10+",  label: "Vehicle Types" },
  { number: "Live", label: "GPS Tracking" },
  { number: "25%",  label: "Advance to Book" },
  { number: "24/7", label: "Customer Support" },
];

export const WHY = [
  { icon: "", title: "Live GPS Tracking",  desc: "Track your vehicle in real time. Share live location with your entire group." },
  { icon: "", title: "Verified Drivers",   desc: "Every driver goes through KYC and background checks before joining Zenera." },
  { icon: "", title: "Pay 25% to Book",    desc: "Confirm with just 25% advance. Pay the rest after the trip. Zero risk." },
  { icon: "", title: "10 Vehicle Types",   desc: "From 4-seater Hatchback to 40+ seat Bus. Every group size has a ride." },
];

export const TESTIMONIALS = [
  {
    text: "Booked a Tempo Traveller for our college trip to Coorg. Driver was on time, vehicle was clean, and the GPS tracking gave our parents peace of mind.",
    name: "Rahul K.", trip: "Bangalore → Coorg · 17 people", initials: "RK",
  },
  {
    text: "Used Zenera for our office team outing to Hampi. Urbania was super comfortable. Booking through the app was seamless — 10 minutes flat.",
    name: "Sneha P.", trip: "Bangalore → Hampi · 20 people", initials: "SP",
  },
  {
    text: "Family pilgrimage to Tirupati with 12 people. The driver knew all the stops along the way. Will definitely book again for our next trip.",
    name: "Murthy N.", trip: "Bangalore → Tirupati · 12 people", initials: "MN",
  },
];

export const APP_FEATURES = [
  { icon: "", text: "Live GPS tracking for your vehicle" },
  { icon: "", text: "Instant booking confirmation" },
  { icon: "", text: "Secure payments via Razorpay" },
  { icon: "", text: "Real-time trip status updates" },
  { icon: "", text: "Digital receipts & trip history" },
];

export const NAV_LINKS = [
  { label: "Fleet",          href: "#fleet" },
  { label: "Packages",       href: "#packages" },
  { label: "Popular Routes", href: "#routes" },
  { label: "Why Zenera",     href: "#why" },
  { label: "About",          href: "#about" },
];
