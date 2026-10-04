import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../Navbar.jsx";
import Footer from "../../Footer.jsx";
import { useTheme } from "../context/ThemeContext";
import { usePageSEO } from "../hooks/usePageSEO";
import { TOUR_PACKAGES } from "../data/packages.js";
import { LINKS } from "../../index.js";

// Comprehensive package metadata mapping images, pricing, ratings, reviews, itineraries, and stay details
const DETAILED_PACKAGE_DATA = {
  "coorg-escape": {
    image: "/destinations/coorg.jpg",
    gallery: [
      "/destinations/coorg.jpg",
      "/destinations/coorg-resort.jpg",
      "/destinations/chikmagalur.jpg",
      "/tour-packages-hero.jpg",
      "/hero-scenic-road.jpg",
    ],
    price: 8499,
    pricePerPerson: 2833,
    originalPrice: 10499,
    discountPercent: 19,
    rating: 4.9,
    reviewsCount: 342,
    location: "Coorg, Karnataka",
    badge: "Best Seller",
    overview:
      "Escape into the misty hills of Coorg — the Scotland of India. Journey through aromatic coffee and spice plantations, witness cascading Abbey Falls, watch elephants at Dubare Camp, and soak in panoramic sunset views from Raja's Seat.",
    hotel: {
      name: "Heritage Coffee Plantation Resort / Premium Homestay",
      location: "Madikeri Valley, Coorg",
      rating: "4.8 / 5",
      roomType: "Deluxe Valley View Cottage with Balcony",
      meals: "Complimentary Plantation Breakfast",
      image: "/destinations/coorg-resort.jpg",
    },
    itineraryDays: [
      {
        day: 1,
        title: "Bangalore to Coorg via Golden Temple & Elephant Camp",
        milestones: [
          "06:30 AM: Doorstep pickup from your location in Bangalore in a sanitized AC vehicle",
          "Scenic highway breakfast stop near Channapatna / Mandya",
          "Visit the golden Tibetan Namdroling Monastery at Bylakuppe",
          "Experience river rafting & elephant interaction at Dubare Elephant Camp",
          "Evening check-in to your plantation stay in Madikeri & welcome coffee",
        ],
      },
      {
        day: 2,
        title: "Madikeri Local Sightseeing, Waterfalls & Sunsets",
        milestones: [
          "Morning guided walking tour through aromatic coffee & pepper estates",
          "Visit the iconic Abbey Falls nestled amidst dense Western Ghats canopy",
          "Explore historical Madikeri Fort & ancient Omkareshwara Temple",
          "Witness panoramic golden hour sunset from Raja's Seat gardens",
          "Optional local Coorg honey, homemade chocolates & spice shopping",
        ],
      },
      {
        day: 3,
        title: "Talacauvery Pilgrimage & Return to Bangalore",
        milestones: [
          "Early morning drive to Talacauvery — origin of the sacred Cauvery River",
          "Climb Brahmagiri Hills for 360-degree misty Western Ghats viewpoints",
          "Hotel check-out and scenic descent through Mysore highway",
          "Evening drop-off at your doorstep in Bangalore with unforgettable memories",
        ],
      },
    ],
    faqs: [
      {
        q: "What is included in the package price?",
        a: "The package includes dedicated commercial AC vehicle with a hill-experienced chauffeur, all fuel, driver night allowances, interstate border permits, tolls, parking charges, and full sightseeing coverage.",
      },
      {
        q: "Can we customize the pickup time or stopovers?",
        a: "Yes! As this is a private trip, you can coordinate flexible pickup times and add stopovers like Mysore Palace or Srirangapatna with your driver.",
      },
      {
        q: "What is the cancellation and rescheduling policy?",
        a: "You can reschedule your trip date for free up to 24 hours before pickup. Cancellations made 48 hours prior receive a full advance refund.",
      },
      {
        q: "Are entry tickets and activities included?",
        a: "Sightseeing transportation is 100% included. Individual monument tickets, elephant camp entry passes, and personal adventure sports are paid directly on-site.",
      },
    ],
  },
  "ooty-hills": {
    image: "/destinations/ooty.jpg",
    gallery: [
      "/destinations/ooty.jpg",
      "/destinations/coorg-resort.jpg",
      "/tour-packages-hero.jpg",
      "/destinations/kerala.jpg",
      "/hero-scenic-road.jpg",
    ],
    price: 8999,
    pricePerPerson: 2999,
    originalPrice: 11299,
    discountPercent: 20,
    rating: 4.8,
    reviewsCount: 289,
    location: "Ooty, Tamil Nadu",
    badge: "Family Favorite",
    overview:
      "Discover the Queen of Hill Stations with rolling tea gardens, tranquil Pykara lake boating, botanical heritage gardens, and the famous Nilgiri mountain highway drive through Bandipur and Mudumalai reserves.",
    hotel: {
      name: "Nilgiri Mountain View Heritage Resort",
      location: "Upper Ooty, Tamil Nadu",
      rating: "4.7 / 5",
      roomType: "Superior Pine View Room with Fireplace",
      meals: "Fresh Nilgiri Breakfast Included",
      image: "/destinations/ooty.jpg",
    },
    itineraryDays: [
      {
        day: 1,
        title: "Bangalore to Ooty via Bandipur Tiger Reserve",
        milestones: [
          "06:00 AM: Bangalore pickup and smooth transit through Mysore expressway",
          "Scenic jungle safari transit drive through Bandipur & Mudumalai forest",
          "Climb the dramatic 36 Kalhatty hairpin bends into the Nilgiri hills",
          "Check-in at Ooty resort, evening stroll around Ooty Lake & Boat House",
        ],
      },
      {
        day: 2,
        title: "Doddabetta Peak, Tea Factory & Coonoor Tour",
        milestones: [
          "Breathtaking 360-degree viewpoint from Doddabetta Peak (highest peak)",
          "Artisanal Tea Factory & Homemade Chocolate Museum visit with live tasting",
          "Excursion to Coonoor: Sim's Park, Lamb's Rock, and Dolphin's Nose viewpoint",
          "Evening visit to the lush Government Botanical Gardens",
        ],
      },
      {
        day: 3,
        title: "Pykara Waterfalls, Lake Boating & Bangalore Drop",
        milestones: [
          "Morning excursion to serene Pykara Waterfalls & Lake with speedboat ride",
          "Photo stops along scenic Pine Forest & Shooting Point meadows",
          "Scenic return drive through forest highway and drop at Bangalore doorstep",
        ],
      },
    ],
    faqs: [
      {
        q: "Is hill road permit included?",
        a: "Yes, all Tamil Nadu interstate permits, hill road e-passes, and tolls are fully cleared and included in your fare.",
      },
      {
        q: "Can we experience the Nilgiri Toy Train?",
        a: "Our chauffeur can drop you at Ooty or Coonoor station and pick you up at the arrival station if you book toy train tickets online in advance.",
      },
    ],
  },
  "chikmagalur-retreat": {
    image: "/destinations/chikmagalur.jpg",
    gallery: [
      "/destinations/chikmagalur.jpg",
      "/destinations/coorg-resort.jpg",
      "/tour-packages-hero.jpg",
      "/hero-scenic-road.jpg",
    ],
    price: 6499,
    pricePerPerson: 3249,
    originalPrice: 7999,
    discountPercent: 18,
    rating: 4.9,
    reviewsCount: 412,
    location: "Chikmagalur, Karnataka",
    badge: "Weekend Special",
    overview:
      "Trek to the highest peak in Karnataka at Mullayanagiri, explore sacred Baba Budangiri, witness cascading Jhari waterfalls, and unwind amidst secluded coffee estates with freshly brewed Malnad coffee.",
    hotel: {
      name: "Misty Valley Coffee Estate Stay",
      location: "Chikmagalur Hills, Karnataka",
      rating: "4.9 / 5",
      roomType: "Estate Plantation Cottage",
      meals: "Authentic Malnad Breakfast & Coffee",
      image: "/destinations/chikmagalur.jpg",
    },
    itineraryDays: [
      {
        day: 1,
        title: "Bangalore to Chikmagalur & Hoysala Belur Temple",
        milestones: [
          "06:30 AM: Doorstep pickup from Bangalore via Hassan highway",
          "Stopover at UNESCO World Heritage Belur Chennakesava Temple architecture",
          "Afternoon check-in at Chikmagalur coffee valley retreat",
          "Visit Coffee Museum and take an evening walk through private coffee trails",
        ],
      },
      {
        day: 2,
        title: "Mullayanagiri Peak, Baba Budangiri & Bangalore Return",
        milestones: [
          "Early morning drive to Mullayanagiri Peak for breathtaking cloud bed views",
          "Excursion to sacred Baba Budangiri hills and Manikyadhara waterfalls",
          "Visit cascading Jhari (Buttermilk) waterfalls via local 4x4 trails",
          "Late afternoon departure and comfortable evening drop in Bangalore",
        ],
      },
    ],
    faqs: [
      {
        q: "Is a 4x4 Jeep required for Mullayanagiri & Jhari Falls?",
        a: "Our chauffeur drives you to the main peak parking. For steep off-road tracks to Jhari falls, local 4x4 Jeeps are available at nominal shared fees.",
      },
    ],
  },
  "mysore-heritage": {
    image: "/destinations/mysore.jpg",
    gallery: [
      "/destinations/mysore.jpg",
      "/destinations/coorg-resort.jpg",
      "/tour-packages-hero.jpg",
      "/hero-scenic-road.jpg",
    ],
    price: 4999,
    pricePerPerson: 2499,
    originalPrice: 5999,
    discountPercent: 16,
    rating: 4.7,
    reviewsCount: 198,
    location: "Mysore, Karnataka",
    badge: "Express Route",
    overview:
      "Explore the royal heritage of Mysore: the illuminated Mysore Royal Palace, Chamundi Hills, Srirangapatna historical sites, vibrant Devaraja markets, and the musical fountain at Brindavan Gardens.",
    hotel: {
      name: "Grand Royal Heritage Palace Hotel",
      location: "Mysore City Center",
      rating: "4.7 / 5",
      roomType: "Royal Executive Deluxe Room",
      meals: "Royal Buffet Breakfast Included",
      image: "/destinations/mysore.jpg",
    },
    itineraryDays: [
      {
        day: 1,
        title: "Bangalore to Mysore via Srirangapatna & Palace Illumination",
        milestones: [
          "07:30 AM: Express transit via Bangalore-Mysore 10-lane Expressway (~2.5 hrs)",
          "Tour Srirangapatna: Tipu Sultan Summer Palace & Ranganathaswamy Temple",
          "Afternoon check-in and grand tour of the Mysore Royal Palace",
          "Evening visit to Brindavan Gardens for the spectacular musical water fountain",
          "Witness the dazzling Mysore Palace illumination under night lights",
        ],
      },
      {
        day: 2,
        title: "Chamundi Hill, Mysore Zoo & Return to Bangalore",
        milestones: [
          "Morning drive to Chamundeshwari Temple atop Chamundi Hills overlooking Mysore",
          "Visit Sri Chamarajendra Zoological Gardens (Mysore Zoo)",
          "Visit St. Philomena's majestic Neo-Gothic Cathedral",
          "Silk saree and sandalwood shopping at authentic Government Silk Weaving Factory",
          "Smooth evening return drop to Bangalore",
        ],
      },
    ],
    faqs: [
      {
        q: "How fast is the travel time to Mysore?",
        a: "With the new 10-lane expressway, transit time is only ~2 to 2.5 hours from Bangalore.",
      },
    ],
  },
  "wayanad-trail": {
    image: "/destinations/kerala.jpg",
    gallery: [
      "/destinations/kerala.jpg",
      "/destinations/coorg-resort.jpg",
      "/tour-packages-hero.jpg",
      "/hero-scenic-road.jpg",
    ],
    price: 8799,
    pricePerPerson: 2933,
    originalPrice: 10999,
    discountPercent: 20,
    rating: 4.8,
    reviewsCount: 265,
    location: "Wayanad, Kerala",
    badge: "Kerala Escapes",
    overview:
      "Journey into God's Own Country: prehistoric Edakkal rock carvings, Banasura earth dam, dense tropical rainforest drives, serene Pookode lake, and cascading waterfalls.",
    hotel: {
      name: "Wayanad Rainforest Eco Resort",
      location: "Vythiri / Lakkidi Hills, Wayanad",
      rating: "4.8 / 5",
      roomType: "Tropical Forest View Villa",
      meals: "Kerala Traditional Breakfast",
      image: "/destinations/kerala.jpg",
    },
    itineraryDays: [
      {
        day: 1,
        title: "Bangalore to Wayanad via Gundlupet Sunflower Fields",
        milestones: [
          "06:00 AM: Bangalore pickup via Mysore expressway & Gundlupet forest stretch",
          "Cross Kerala border and check-in to your rainforest resort in Wayanad",
          "Visit Pookode Natural freshwater lake & enjoy pedaling / boating",
          "Breathtaking sunset views from Lakkidi View Point over the ghat pass",
        ],
      },
      {
        day: 2,
        title: "Banasura Sagar Dam & Edakkal Neolithic Caves",
        milestones: [
          "Visit Banasura Sagar Dam — largest earth dam in India with speedboating",
          "Trek to historic Edakkal Caves to witness 6,000-year-old Neolithic carvings",
          "Explore Soochipara / Meenmutty Waterfalls surrounded by lush tea estates",
          "Evening campfire at resort with traditional Kerala cuisine",
        ],
      },
      {
        day: 3,
        title: "Wayanad Wildlife Sanctuary & Return to Bangalore",
        milestones: [
          "Morning wildlife drive through Muthanga Wildlife Sanctuary",
          "Spice shopping for authentic organic cardamom, pepper, and vanilla",
          "Relaxed return drive through forest highway and evening drop at Bangalore",
        ],
      },
    ],
    faqs: [
      {
        q: "Are Kerala interstate border taxes covered?",
        a: "Yes, all Kerala commercial motor vehicle border permits and taxes are 100% included in the fare.",
      },
    ],
  },
  "gokarna-coastal": {
    image: "/destinations/gokarna.jpg",
    gallery: [
      "/destinations/gokarna.jpg",
      "/destinations/coorg-resort.jpg",
      "/tour-packages-hero.jpg",
      "/hero-scenic-road.jpg",
    ],
    price: 9999,
    pricePerPerson: 3333,
    originalPrice: 12499,
    discountPercent: 20,
    rating: 4.9,
    reviewsCount: 520,
    location: "Gokarna, Karnataka",
    badge: "Group Favorite",
    overview:
      "Hike along the 5-beach cliffside trail of Gokarna (Om Beach, Kudle Beach, Half Moon Beach), marvel at the towering Lord Shiva monument at Murudeshwar, and unwind on untouched Arabian Sea shores.",
    hotel: {
      name: "Arabian Sea Beachside Resort",
      location: "Kudle Beach Road, Gokarna",
      rating: "4.8 / 5",
      roomType: "Coastal Sea Breeze Cottage",
      meals: "Continental & Coastal Breakfast",
      image: "/destinations/gokarna.jpg",
    },
    itineraryDays: [
      {
        day: 1,
        title: "Bangalore to Gokarna via Murudeshwar Beach & Temple",
        milestones: [
          "05:30 AM: Bangalore pickup in a spacious AC vehicle with pushback seats",
          "Stopover at Murudeshwar: visit the 123-ft Lord Shiva statue and beach view",
          "Arrive in Gokarna, check-in to beachside resort, and watch sunset at Kudle Beach",
          "Evening seaside shack dinner with acoustic music and coastal vibes",
        ],
      },
      {
        day: 2,
        title: "5-Beach Cliffside Trek & Sacred Mahabaleshwar Pilgrimage",
        milestones: [
          "Morning guided cliffside trek: Om Beach → Half Moon Beach → Paradise Beach",
          "Watersports at Om Beach (Jet ski, banana boat, dolphin spotting boat ride)",
          "Visit ancient 4th-century Mahabaleshwar Temple (Atmalinga shrine)",
          "Sunset drum circle and beach stargazing at Kudle Beach",
        ],
      },
      {
        day: 3,
        title: "Mirjan Fort Exploration & Return to Bangalore",
        milestones: [
          "Morning visit to historical 16th-century Mirjan Fort covered in green moss",
          "Fresh coastal seafood lunch stop near Honnavar backwaters",
          "Smooth return drive via Hubli-Bangalore 6-lane highway and doorstep drop",
        ],
      },
    ],
    faqs: [
      {
        q: "Is the beach trek suitable for beginners?",
        a: "Yes! The Kudle to Om Beach cliffside trail is scenic, gentle, and well-marked. Boat transfers are also available between beaches.",
      },
    ],
  },
};

export default function PackageDetail() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // Find package from data
  const basePackage = useMemo(() => {
    return (
      TOUR_PACKAGES.find((p) => p.id === packageId) ||
      TOUR_PACKAGES.find((p) => p.destination.toLowerCase() === packageId?.toLowerCase()) ||
      TOUR_PACKAGES[0]
    );
  }, [packageId]);

  const packageData = useMemo(() => {
    const meta = DETAILED_PACKAGE_DATA[basePackage.id] || DETAILED_PACKAGE_DATA["coorg-escape"];
    return {
      ...basePackage,
      ...meta,
    };
  }, [basePackage]);

  usePageSEO({
    title: `${packageData.name} | Tour Packages | Zenera Trips`,
    description: packageData.overview || packageData.tagline,
    robots: "index, follow",
    canonical: `https://zenera-trips.web.app/packages/${packageData.id}`,
  });

  // State Management
  const [activeSection, setActiveSection] = useState("overview");
  const [travelers, setTravelers] = useState(2);
  const [selectedTripDate, setSelectedTripDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeFaq, setActiveFaq] = useState(0);

  // Wishlist State with local persistence
  const [isWishlisted, setIsWishlisted] = useState(() => {
    try {
      const saved = localStorage.getItem("zenera_wishlist");
      return saved ? JSON.parse(saved).includes(packageData.id) : false;
    } catch {
      return false;
    }
  });

  const toggleWishlist = () => {
    setIsWishlisted((prev) => {
      const next = !prev;
      try {
        const saved = JSON.parse(localStorage.getItem("zenera_wishlist") || "[]");
        const updated = next
          ? [...saved, packageData.id]
          : saved.filter((id) => id !== packageData.id);
        localStorage.setItem("zenera_wishlist", JSON.stringify(updated));
      } catch {}
      return next;
    });
  };

  // Pricing Calculation
  const totalCalculatedPrice = useMemo(() => {
    return packageData.price;
  }, [packageData.price]);

  const advanceToPay = useMemo(() => {
    return Math.round((totalCalculatedPrice * 25) / 100);
  }, [totalCalculatedPrice]);

  // Navigate directly to Book page
  const handleProceedToBook = () => {
    navigate(
      `/book?destination=${encodeURIComponent(packageData.destination)}&route=${encodeURIComponent(packageData.name)}&vehicle=${encodeURIComponent(packageData.suggestedVehicle)}&start=${encodeURIComponent(selectedTripDate)}&pickup=Bangalore`
    );
  };

  // Section Scroll Handler
  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex !== null) {
        if (e.key === "Escape") setLightboxIndex(null);
        if (e.key === "ArrowRight") {
          setLightboxIndex((prev) => (prev + 1) % packageData.gallery.length);
        }
        if (e.key === "ArrowLeft") {
          setLightboxIndex((prev) => (prev - 1 + packageData.gallery.length) % packageData.gallery.length);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, packageData.gallery.length]);

  // Related Packages (excluding current package)
  const relatedPackages = useMemo(() => {
    return TOUR_PACKAGES.filter((p) => p.id !== packageData.id).slice(0, 3);
  }, [packageData.id]);

  const SECTIONS = [
    { id: "overview", label: "Overview" },
    { id: "highlights", label: "Highlights" },
    { id: "itinerary", label: "Itinerary" },
    { id: "inclusions", label: "Inclusions" },
    { id: "stay", label: "Stay Details" },
    { id: "reviews", label: "Reviews" },
    { id: "faqs", label: "FAQs" },
  ];

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white font-sans selection:bg-orange selection:text-white flex flex-col justify-between transition-colors duration-200">
      
      {/* Top Header */}
      <Navbar />

      <main className="flex-1 pt-18 sm:pt-20">
        
        {/* ========================================================
            1. BREADCRUMB & TITLE HEADER
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto pb-1 scrollbar-none">
            <Link to="/" className="hover:text-orange transition-colors">Home</Link>
            <span>/</span>
            <Link to="/packages" className="hover:text-orange transition-colors">Tour Packages</Link>
            <span>/</span>
            <span className="text-charcoal dark:text-white font-bold truncate max-w-[200px] sm:max-w-none">
              {packageData.name}
            </span>
          </nav>
        </section>

        {/* ========================================================
            2. HERO GALLERY & QUICK SPECS (Split Grid)
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT 7 COLS: DESTINATION IMAGE SHOWCASE */}
            <div className="lg:col-span-7">
              <div
                onClick={() => setLightboxIndex(0)}
                className="w-full h-[360px] sm:h-[440px] rounded-3xl overflow-hidden relative cursor-pointer group shadow-sm border border-[#E2E8F0] dark:border-[#1E2E42]"
              >
                <img
                  src={packageData.image}
                  alt={packageData.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                
                {/* Badge & Wishlist */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-white/95 dark:bg-black/80 backdrop-blur-md text-orange border border-orange/20 shadow-md">
                    {packageData.badge}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist();
                    }}
                    className={`p-2.5 rounded-full backdrop-blur-md transition-transform active:scale-90 cursor-pointer shadow-md ${
                      isWishlisted
                        ? "bg-rose-500 text-white"
                        : "bg-black/40 hover:bg-black/60 text-white"
                    }`}
                    aria-label="Wishlist Package"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </button>
                </div>

                {/* Click to Enlarge Tag */}
                <div className="absolute bottom-4 left-4 text-white text-xs font-semibold flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md">
                  <span>Click to View Fullscreen</span>
                </div>
              </div>
            </div>

            {/* RIGHT 5 COLS: KEY PACKAGE DETAILS CARD */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              
              {/* Location & Rating */}
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
                  {packageData.location}
                </span>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                  <span>{packageData.rating}</span>
                  <span className="text-slate-400 text-[11px]">({packageData.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Package Main Title */}
              <div>
                <h1 className="font-extrabold text-2xl sm:text-3xl text-charcoal dark:text-white tracking-tight leading-tight">
                  {packageData.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {packageData.tagline}
                </p>
              </div>

              {/* 4 Quick Specs Pills Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42]">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Duration</span>
                  <span className="font-extrabold text-xs sm:text-sm text-charcoal dark:text-white">
                    {packageData.duration}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42]">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Dedicated Fleet</span>
                  <span className="font-extrabold text-xs sm:text-sm text-orange">
                    {packageData.suggestedVehicle}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42]">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Sightseeing</span>
                  <span className="font-extrabold text-xs sm:text-sm text-charcoal dark:text-white">
                    {packageData.majorDestinations?.length || 5} Major Sights
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42]">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">All Clear</span>
                  <span className="font-extrabold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                    Tolls & Taxes Paid
                  </span>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Starting Package Fare
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-extrabold text-3xl text-orange font-mono">
                      ₹{packageData.price.toLocaleString("en-IN")}
                    </span>
                    {packageData.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{packageData.originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                    Pay only 25% (₹{advanceToPay.toLocaleString("en-IN")}) advance to book
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToBook}
                  className="py-3 px-6 rounded-2xl bg-orange hover:bg-orangeLight active:scale-[0.99] text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-orange/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Book Now</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================
            3. STICKY SECTION NAVIGATION BAR
           ======================================================== */}
        <div className="sticky top-14 sm:top-16 z-30 bg-white/95 dark:bg-[#07111F]/95 backdrop-blur-md border-y border-[#E2E8F0] dark:border-[#1E2E42] shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto py-3 scrollbar-none">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeSection === sec.id
                      ? "bg-orange text-white shadow-sm shadow-orange/25"
                      : "text-slate-600 dark:text-slate-300 hover:text-orange dark:hover:text-orange"
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================
            4. MAIN BODY DETAILS + STICKY BOOKING SIDEBAR
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT 8 COLS: COMPREHENSIVE SECTIONS */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* SECTION: OVERVIEW */}
              <div id="overview" className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="font-extrabold text-xl sm:text-2xl text-charcoal dark:text-white tracking-tight">
                  Trip Overview
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {packageData.overview}
                </p>

                {/* Distance & Route Pill */}
                <div className="p-4 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px] block">Full Route Transit</span>
                    <span className="font-semibold text-charcoal dark:text-white mt-0.5 block">{packageData.routeDescription}</span>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-orange/10 text-orange font-bold shrink-0">
                    {packageData.distance}
                  </span>
                </div>
              </div>

              {/* SECTION: HIGHLIGHTS */}
              <div id="highlights" className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <h2 className="font-extrabold text-xl sm:text-2xl text-charcoal dark:text-white tracking-tight">
                  Package Highlights
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {packageData.highlights?.map((h, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42] flex items-start gap-3"
                    >
                      <div className="w-7 h-7 rounded-xl bg-orange/10 text-orange flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-charcoal dark:text-white leading-relaxed">
                        {h}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Sights Visited Tags */}
                <div className="pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Sightseeing Spots Included
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {packageData.majorDestinations?.map((spot, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-orange/10 border border-orange/20 text-orange font-bold text-xs"
                      >
                        {spot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION: ITINERARY */}
              <div id="itinerary" className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="font-extrabold text-xl sm:text-2xl text-charcoal dark:text-white tracking-tight">
                    Day-by-Day Itinerary
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Customized itinerary with flexible photo stops and comfortable transit pacing.
                  </p>
                </div>

                <div className="space-y-6">
                  {packageData.itineraryDays?.map((dayObj) => (
                    <div
                      key={dayObj.day}
                      className="p-5 sm:p-6 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42] relative overflow-hidden space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-xl bg-orange text-white font-extrabold text-xs shadow-sm shadow-orange/20">
                          Day {dayObj.day}
                        </span>
                        <h3 className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white">
                          {dayObj.title}
                        </h3>
                      </div>

                      <ul className="space-y-2 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        {dayObj.milestones?.map((m, mIdx) => (
                          <li key={mIdx} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2 shrink-0" />
                            <span className="leading-relaxed">{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: INCLUSIONS & EXCLUSIONS */}
              <div id="inclusions" className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <h2 className="font-extrabold text-xl sm:text-2xl text-charcoal dark:text-white tracking-tight">
                  What's Included & Excluded
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Inclusions */}
                  <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span>Inclusions</span>
                    </h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {packageData.inclusions?.map((inc, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Exclusions */}
                  <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                      <span>Exclusions</span>
                    </h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {packageData.exclusions?.map((exc, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* SECTION: STAY DETAILS */}
              <div id="stay" className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="font-extrabold text-xl sm:text-2xl text-charcoal dark:text-white tracking-tight">
                  Stay Details & Partner Resorts
                </h2>

                <div className="p-5 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white">
                        {packageData.hotel?.name || "Partner Plantation Resort"}
                      </h3>
                      <span className="text-xs text-amber-500 font-bold">{packageData.hotel?.rating}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {packageData.hotel?.location} • {packageData.hotel?.roomType}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                      {packageData.hotel?.meals}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION: REVIEWS */}
              <div id="reviews" className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-extrabold text-xl sm:text-2xl text-charcoal dark:text-white tracking-tight">
                      Traveler Reviews
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Verified experiences from travelers who booked this package
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <span className="font-extrabold text-2xl text-amber-500 font-mono">
                      {packageData.rating}
                    </span>
                    <div className="text-xs">
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-slate-500 font-medium">({packageData.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Customer Review Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-charcoal dark:text-white">Rahul K. (Family Trip)</span>
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      "Driver was punctual and drove safely on the hill roads. The Innova Crysta was sparkling clean and the plantation stops were amazing!"
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-charcoal dark:text-white">Sneha P. (Group Outing)</span>
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      "Smooth booking with 25% advance. We didn't have to worry about toll queues or driver night stay. Highly recommended for weekend getaways."
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION: FAQS */}
              <div id="faqs" className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="font-extrabold text-xl sm:text-2xl text-charcoal dark:text-white tracking-tight">
                  Frequently Asked Questions
                </h2>

                <div className="space-y-3">
                  {packageData.faqs?.map((faq, idx) => {
                    const isOpen = activeFaq === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-[#E2E8F0] dark:border-[#1E2E42] overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setActiveFaq(isOpen ? null : idx)}
                          className="w-full p-4 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-charcoal dark:text-white bg-[#F5F7FA] dark:bg-[#0A1420] cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          <svg className={`w-4 h-4 text-orange transition-transform duration-200 ml-2 shrink-0 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isOpen && (
                          <div className="p-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#0E1A29]">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT 4 COLS: STICKY BOOKING CARD */}
            <div className="lg:col-span-4 sticky top-28 space-y-6">
              
              <div className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-900/5 dark:shadow-2xl space-y-5">
                
                {/* Header */}
                <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
                  <h3 className="font-extrabold text-lg text-charcoal dark:text-white tracking-tight">
                    Book This Package
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Instant chauffeur confirmation
                  </p>
                </div>

                {/* Price Display */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Package Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-extrabold text-3xl text-orange font-mono">
                      ₹{packageData.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      (All-Inclusive)
                    </span>
                  </div>
                </div>

                {/* Travel Date Picker */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Travel Start Date
                  </label>
                  <input
                    type="date"
                    value={selectedTripDate}
                    onChange={(e) => setSelectedTripDate(e.target.value)}
                    className="w-full bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-charcoal dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-orange"
                  />
                </div>

                {/* Advance Notice */}
                <div className="p-3.5 rounded-2xl bg-orange/10 border border-orange/20 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-orange">
                    <span>Pay 25% Advance:</span>
                    <span className="font-mono text-sm">₹{advanceToPay.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Pay balance directly to driver during the trip.
                  </p>
                </div>

                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={handleProceedToBook}
                  className="w-full py-4 px-6 rounded-2xl bg-orange hover:bg-orangeLight active:scale-[0.99] text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-orange/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Book Now</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>

                {/* Reassurance Feature List */}
                <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E2E42] space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span><strong>Secure Booking:</strong> 100% encrypted & safe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-orange shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span><strong>24/7 Concierge:</strong> Support on call & WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span><strong>Free Reschedule:</strong> Up to 24 hours prior</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ========================================================
            5. RELATED PACKAGES SECTION
           ======================================================== */}
        {relatedPackages.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#E2E8F0] dark:border-[#1E2E42]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-extrabold text-xl sm:text-2xl text-charcoal dark:text-white tracking-tight">
                  You May Also Like
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Popular getaway packages from Bangalore
                </p>
              </div>

              <Link
                to="/packages"
                className="text-xs font-bold text-orange hover:underline"
              >
                View All Packages →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPackages.map((relPkg) => {
                const relMeta = DETAILED_PACKAGE_DATA[relPkg.id] || DETAILED_PACKAGE_DATA["coorg-escape"];
                return (
                  <Link
                    key={relPkg.id}
                    to={`/packages/${relPkg.id}`}
                    className="group bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="h-44 overflow-hidden relative">
                      <img
                        src={relMeta.image}
                        alt={relPkg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 text-white font-bold text-[10px]">
                        {relPkg.duration}
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <span className="text-[10px] font-semibold text-slate-400">{relPkg.destination}</span>
                      <h3 className="font-bold text-sm text-charcoal dark:text-white group-hover:text-orange transition-colors truncate">
                        {relPkg.name}
                      </h3>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-extrabold text-base text-orange font-mono">
                          ₹{relMeta.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs font-bold text-orange">View Details →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </main>

      {/* ========================================================
          6. FULLSCREEN IMAGE LIGHTBOX
         ======================================================== */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Close Lightbox"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-5xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl"
            >
              <img
                src={packageData.image}
                alt={packageData.name}
                className="max-h-[85vh] w-auto max-w-full object-contain rounded-2xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          7. MOBILE STICKY BOTTOM BOOKING BAR
         ======================================================== */}
      <div className="lg:hidden sticky bottom-0 z-40 bg-white dark:bg-[#0E1A29] border-t border-[#E2E8F0] dark:border-[#1E2E42] p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Package</span>
            <span className="font-extrabold text-xl text-orange font-mono">
              ₹{packageData.price.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            type="button"
            onClick={handleProceedToBook}
            className="py-3 px-6 rounded-xl bg-orange text-white font-bold text-xs sm:text-sm hover:bg-orangeLight transition-all shadow-md shadow-orange/30 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Book Now</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
}
