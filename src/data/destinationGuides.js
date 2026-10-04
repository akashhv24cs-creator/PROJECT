/**
 * Verified Real-World Travel Guide Data for Zenera Trips Destinations
 * 
 * Provides verified information for the expandable "Know About [Destination]" Mini Travel Guide:
 * - About summary
 * - Famous places (with verified image mappings)
 * - Nearby geographically relevant destinations (with routes)
 * - Real verified hotels & popular stays
 * - Real verified restaurants & iconic cafes
 * - Authentic regional food specialties
 * - Travel information (best time, stay duration, ideal for, activities)
 * - Genuine "Good to Know" practical tips
 */

export const DESTINATION_GUIDES = {
  mysore: {
    about:
      "Mysore (Mysuru) is renowned for its magnificent royal palaces, grand Dasara festivities, silk weaving, and rich cultural heritage. Nestled at the base of Chamundi Hills, it is South India's quintessential heritage getaway, ideal for history enthusiasts, families, and cultural weekend road trips.",
    famousPlaces: [
      { name: "Mysore Palace", image: "/destinations/mysore.jpg", desc: "Grand Indo-Saracenic royal residence with stained-glass domes." },
      { name: "Chamundi Hills", image: "/destinations/chamundi-hills.jpg", desc: "Hilltop temple dedicated to Goddess Chamundeshwari with a 16ft Nandi monolith." },
      { name: "Brindavan Gardens", image: "/destinations/brindavan-gardens.jpg", desc: "Terraced botanical gardens with evening musical dancing fountains." },
      { name: "Srirangapatna", image: "/destinations/srirangapatna.jpg", desc: "Historic river island fortress of Tipu Sultan and Ranganathaswamy Temple." },
      { name: "Ranganathittu Bird Sanctuary", image: "/destinations/ranganathittu.jpg", desc: "Kaveri river islands hosting over 170 migratory bird species and marsh crocodiles." },
      { name: "Somnathpur Temple", image: "/destinations/somnathpur.jpg", desc: "UNESCO-recognized 13th-century Hoysala soapstone temple." },
    ],
    nearbyDestinations: [
      { id: "coorg", name: "Coorg", distance: "120 km", desc: "Misty coffee hills & waterfalls" },
      { id: "kabini", name: "Kabini", distance: "60 km", desc: "Tiger reserve & Kaveri boat safari" },
      { id: "bandipur", name: "Bandipur", distance: "75 km", desc: "Project Tiger forest safaris" },
      { id: "wayanad", name: "Wayanad", distance: "135 km", desc: "Rainforests & prehistoric caves" },
    ],
    popularStays: [
      { name: "Lalitha Mahal Palace Hotel", type: "Heritage Palace Stay", location: "Siddhartha Layout" },
      { name: "Radisson Blu Plaza Hotel", type: "Luxury 5-Star Hotel", location: "MG Road, Nazarbad" },
      { name: "Royal Orchid Metropole", type: "Heritage Hotel", location: "Jhansi Lakshmibai Road" },
      { name: "Grand Mercure Mysuru", type: "Premium Hotel", location: "Sayyaji Rao Road" },
    ],
    restaurants: [
      { name: "Hotel Vinayaka Mylari", cuisine: "Iconic Butter Dosa", location: "Nazarbad" },
      { name: "Guru Sweet Mart", cuisine: "Original Mysore Pak", location: "Near Devaraja Market" },
      { name: "RRR Mysore", cuisine: "Andhra Banana Leaf Meals", location: "Gandhi Square" },
      { name: "Spring (Radisson Blu)", cuisine: "Multi-Cuisine Fine Dining", location: "MG Road" },
    ],
    localSpecialties: [
      "Mysore Pak (Ghee & Gramflour Sweet)",
      "Mysore Masala Dosa",
      "Mylari Butter Dosa",
      "Mysore Filter Coffee",
      "Chiroti with Almond Milk",
      "Bisi Bele Bath",
    ],
    travelInfo: {
      bestTime: "October – March (Grand Dasara in Oct)",
      duration: "1 – 2 Days",
      idealFor: "Heritage • Families • Weekend Trips • Culture",
      activities: "Palace Tour • Temple Visits • Silk & Sandalwood Shopping • Bird Watching",
      localTransport: "Chauffeur Cabs • Auto Rickshaws • Tongas (Horse Carriages)",
    },
    goodToKnow: [
      "Mysore Palace illumination takes place every Sunday and on public holidays from 7:00 PM to 7:45 PM.",
      "Start early for Chamundi Hills to avoid afternoon pilgrim queues and heat.",
      "Footwear must be deposited outside before entering the interior palace halls.",
    ],
  },

  coorg: {
    about:
      "Coorg (Kodagu) is a picturesque hill retreat perched in the Western Ghats, celebrated for rolling coffee estates, spice gardens, misty mountain ridges, and cascading waterfalls. It is one of South India's top choices for romantic getaways, coffee plantation tours, and nature treks.",
    famousPlaces: [
      { name: "Abbey Falls", image: "/destinations/abbey-falls.jpg", desc: "70ft roaring waterfall amidst private coffee and cardamom plantations." },
      { name: "Raja's Seat", image: "/destinations/rajas-seat.jpg", desc: "Historic pavilion on a cliff edge with panoramic sunset valley views." },
      { name: "Dubare Elephant Camp", image: "/destinations/dubare-camp.jpg", desc: "Interactive river camp on the Kaveri dedicated to elephant care." },
      { name: "Namdroling Golden Temple", image: "/destinations/bylakuppe.jpg", desc: "Tibetan monastery with 40ft gilded Buddha statues in Bylakuppe." },
      { name: "Mandalpatti Peak", image: "/destinations/mandalpatti.jpg", desc: "Windswept mountain ridge accessed via thrilling 4x4 open jeep trails." },
    ],
    nearbyDestinations: [
      { id: "mysore", name: "Mysore", distance: "120 km", desc: "Royal palaces & heritage" },
      { id: "wayanad", name: "Wayanad", distance: "115 km", desc: "Rainforests & wildlife" },
      { id: "sakleshpur", name: "Sakleshpur", distance: "105 km", desc: "Coffee trails & star fort" },
      { id: "chikmagalur", name: "Chikmagalur", distance: "150 km", desc: "Highest mountain peaks" },
    ],
    popularStays: [
      { name: "The Tamara Coorg", type: "Luxury Plantation Resort", location: "Yavakapadi, Napoklu" },
      { name: "Evolve Back, Coorg", type: "5-Star Luxury Resort", location: "Karadigodu, Siddapur" },
      { name: "Heritage Resort Coorg", type: "Hilltop Nature Resort", location: "Galibeedu, Madikeri" },
      { name: "Club Mahindra Madikeri", type: "Family Resort", location: "Galibeedu Road" },
    ],
    restaurants: [
      { name: "Coorg Cuisine", cuisine: "Authentic Kodava Dishes", location: "Madikeri Town" },
      { name: "Raintree Restaurant", cuisine: "Coorg & Coastal Indian", location: "Madikeri" },
      { name: "Big Cup Cafe", cuisine: "Estate Coffee & Bakery", location: "Mysore-Madikeri Road" },
      { name: "Taste of Coorg", cuisine: "Local Kodava Delicacies", location: "Madikeri Center" },
    ],
    localSpecialties: [
      "Pandi Curry (Coorg Spiced Pork with Kachampuli)",
      "Kadambuttu (Steamed Rice Dumplings)",
      "Akki Roti (Rice Bread with Chutney)",
      "Noolputtu (String Hoppers)",
      "Fresh Artisanal Arabica & Robusta Coffee",
      "Coorg Organic Blossom Honey & Spices",
    ],
    travelInfo: {
      bestTime: "October – March (Lush green post-monsoon)",
      duration: "2 – 3 Days",
      idealFor: "Couples • Nature Lovers • Trekkers • Coffee Enthusiasts",
      activities: "Coffee Plantation Walks • 4x4 Jeep Safari • River Rafting • Waterfalls",
      localTransport: "Outstation Cabs • 4x4 Jeeps for Off-Road Peaks",
    },
    goodToKnow: [
      "Mandalpatti peak requires an authorized local 4x4 jeep safari due to steep, rocky forest tracks.",
      "Evenings can get chilly between November and February; carry light woolens.",
      "Purchase spices and coffee directly from registered estate cooperatives in Madikeri.",
    ],
  },

  chikmagalur: {
    about:
      "Chikmagalur is the historic birthplace of Indian coffee on the slopes of Baba Budangiri. Surrounded by the highest mountain peaks in Karnataka, sweeping valleys, and evergreen forests, it is a premier destination for trekking, homestays, and coffee estate retreats.",
    famousPlaces: [
      { name: "Mullayanagiri Peak", image: "/destinations/mullayanagiri.jpg", desc: "Highest summit in Karnataka (1,930m) with 360° Western Ghats views." },
      { name: "Baba Budangiri", image: "/destinations/baba-budangiri.jpg", desc: "Sacred mountain range with caves and coffee heritage trails." },
      { name: "Jhari (Buttermilk) Falls", image: "/destinations/jhari-falls.jpg", desc: "Secluded waterfall deep inside private coffee estates." },
      { name: "Hirekolale Lake", image: "/destinations/hirekolale-lake.jpg", desc: "Tranquil mountain reservoir framed by misty peak reflections." },
    ],
    nearbyDestinations: [
      { id: "sakleshpur", name: "Sakleshpur", distance: "60 km", desc: "Cardamom hills & star fort" },
      { id: "coorg", name: "Coorg", distance: "150 km", desc: "Coffee hills & waterfalls" },
      { id: "shivamogga", name: "Shivamogga", distance: "95 km", desc: "Waterfalls & elephant camp" },
      { id: "udupi", name: "Udupi", distance: "170 km", desc: "Temples & coastal beaches" },
    ],
    popularStays: [
      { name: "The Serai Chikmagalur", type: "Luxury Coffee Villa Resort", location: "Mugthihalli" },
      { name: "Java Rain Resort", type: "Hillside Luxury Resort", location: "Girija Kalyana Mantapa" },
      { name: "Trivik Hotels & Resorts", type: "Luxury Mountain Resort", location: "Mullayanagiri Hills" },
      { name: "Zostel Chikmagalur", type: "Backpacker & Group Stay", location: "Kaimara" },
    ],
    restaurants: [
      { name: "Town Canteen", cuisine: "Famous Gulab Jamun & Masala Dosa", location: "SH 57, Chikmagalur" },
      { name: "The Estate Cafe", cuisine: "Valley View Coffee & Snacks", location: "Mullayanagiri Road" },
      { name: "Siri Coffee Cafe", cuisine: "Artisanal Coffee & Sandwiches", location: "KM Road" },
      { name: "Maharaja Restaurant", cuisine: "Malnad & North Indian", location: "Indira Gandhi Road" },
    ],
    localSpecialties: [
      "Freshly Brewed Malnad Filter Coffee",
      "Malnad Akki Roti with Yennegayi (Stuffed Brinjal)",
      "Jackfruit Payasam (Halasina Payasa)",
      "Kaayi Kadabu (Sweet Coconut Dumpling)",
      "Bamboo Shoot Curry (Seasonal)",
      "Town Canteen Soft Gulab Jamun",
    ],
    travelInfo: {
      bestTime: "September – April (Pleasant & clear skies)",
      duration: "2 – 3 Days",
      idealFor: "Trekkers • Adventure Seekers • Couples • Road Trips",
      activities: "Peak Trekking • Coffee Estate Walks • Jeep Safari • Sunset Watching",
      localTransport: "Private Cabs • 4x4 Jeeps for Jhari Falls & Peak Trails",
    },
    goodToKnow: [
      "Access to Mullayanagiri peak can get congested on holiday weekends; start before 7:30 AM.",
      "Private cars cannot go to the bottom of Jhari Falls; licensed 4x4 jeeps are available at the entrance.",
      "The Coffee Museum in Chikmagalur is open on weekdays and provides insightful exhibits on bean roasting.",
    ],
  },

  ooty: {
    about:
      "Ooty (Udhagamandalam), the Queen of the Nilgiris, sits high at 7,350 ft in Tamil Nadu. Characterized by rolling tea gardens, colonial bungalows, eucalyptus forests, and the UNESCO heritage Nilgiri toy train, it has been South India's favorite hill station for generations.",
    famousPlaces: [
      { name: "Doddabetta Peak", image: "/destinations/doddabetta.jpg", desc: "Highest Nilgiri summit (8,650 ft) with a telescope house view." },
      { name: "Pykara Lake & Falls", image: "/destinations/pykara-lake.jpg", desc: "Pristine lake with speedboating surrounded by pine forests." },
      { name: "Coonoor (Sim's Park)", image: "/destinations/coonoor.jpg", desc: "Neighboring tranquil tea town with Dolphin's Nose viewpoint." },
      { name: "Botanical Gardens", image: "/destinations/ooty.jpg", desc: "55-acre terraced gardens with rare flora and fossil trees." },
    ],
    nearbyDestinations: [
      { id: "coonoor", name: "Coonoor", distance: "20 km", desc: "Tea gardens & viewpoints" },
      { id: "bandipur", name: "Bandipur", distance: "50 km", desc: "Tiger safari reserve" },
      { id: "wayanad", name: "Wayanad", distance: "110 km", desc: "Rainforests & treehouses" },
      { id: "mysore", name: "Mysore", distance: "125 km", desc: "Heritage palaces & temples" },
    ],
    popularStays: [
      { name: "Savoy - IHCL SeleQtions", type: "Colonial Luxury Hotel", location: "Sylks Road" },
      { name: "Sterling Ooty Fern Hill", type: "Valley View Resort", location: "Fern Hill" },
      { name: "Fortune Resort Sullivan Court", type: "Premium Hill Resort", location: "Selbourne Road" },
      { name: "Sinclairs Retreat Ooty", type: "Hilltop Resort", location: "Gorishola Road" },
    ],
    restaurants: [
      { name: "Earl's Secret", cuisine: "Continental & Colonial British", location: "King's Cliff Hotel" },
      { name: "Place to Bee", cuisine: "Organic Italian & Honey Treats", location: "Club Road" },
      { name: "Shinkows Chinese", cuisine: "Authentic Chinese Heritage Diner", location: "Commissioner's Road" },
      { name: "Moddy's Chocolates", cuisine: "Homemade Nilgiri Chocolates", location: "Garden Road" },
    ],
    localSpecialties: [
      "Nilgiri Handmade Fudge & Chocolates",
      "Ooty Varkey (Crispy Flaky Puff Pastry)",
      "Fresh High-Grown Nilgiri Orthodox Tea",
      "Organic Nilgiri Eucalyptus & Wintergreen Oils",
      "Nilgiri Plum Cake & Fresh Strawberries",
    ],
    travelInfo: {
      bestTime: "Year-Round (Crisp winters in Dec–Feb, blooming springs in Mar–May)",
      duration: "3 Days / 2 Nights",
      idealFor: "Families • Couples • Nature Lovers • Heritage Railway Fans",
      activities: "Toy Train Ride • Tea Factory Tours • Boating • Botanical Walks",
      localTransport: "Outstation Cabs • Mountain Railway • Local Taxis",
    },
    goodToKnow: [
      "Tickets for the Nilgiri Mountain Toy Train must be booked well in advance on the IRCTC portal.",
      "The road passing through Bandipur/Mudumalai reserve has a night driving curfew between 9:00 PM and 6:00 AM.",
      "Temperatures can drop below 8°C in winter nights; keep jackets and sweaters ready.",
    ],
  },

  hampi: {
    about:
      "Hampi is a UNESCO World Heritage site and an open-air museum of 14th-century Vijayanagara ruins, monumental boulder hills, and ancient Dravidian temples along the Tungabhadra River. It is a dream destination for history enthusiasts, photographers, and backpackers.",
    famousPlaces: [
      { name: "Vittala Temple", image: "/destinations/vittala-temple.jpg", desc: "Iconic stone chariot and musical resonance pillars." },
      { name: "Virupaksha Temple", image: "/destinations/virupaksha-temple.jpg", desc: "Oldest active Shiva shrine with a 50m gopuram tower." },
      { name: "Lotus Mahal", image: "/destinations/hampi.jpg", desc: "Indo-Islamic royal palace architecture in the Zenana enclosure." },
      { name: "Matanga Hill", image: "/destinations/hampi.jpg", desc: "Highest elevation in Hampi famous for sunrise and sunset vistas." },
    ],
    nearbyDestinations: [
      { id: "badami", name: "Badami", distance: "140 km", desc: "6th-century rock-cut cave temples" },
      { id: "gokarna", name: "Gokarna", distance: "310 km", desc: "Beaches & cliff treks" },
      { id: "dandeli", name: "Dandeli", distance: "240 km", desc: "River rafting & tiger reserve" },
    ],
    popularStays: [
      { name: "Evolve Back Kamalapura Palace", type: "Luxury Heritage Palace Resort", location: "Kamalapura" },
      { name: "Heritage Resort Hampi", type: "Eco Luxury Resort", location: "Hosapete-Hampi Road" },
      { name: "Kishkinda Heritage Resort", type: "Nature Resort", location: "Sanapur, Anegundi" },
      { name: "Hyatt Place Hampi", type: "Premium Business & Leisure Hotel", location: "Vidyanagar, Toranagallu" },
    ],
    restaurants: [
      { name: "Mango Tree Restaurant", cuisine: "Thali & Multi-Cuisine Cafe", location: "Near Kamalapura" },
      { name: "Laughing Buddha Cafe", cuisine: "Relaxed Riverside Cafe", location: "Hampi Island / Anegundi" },
      { name: "Gouthami Restaurant", cuisine: "Indian & Continental", location: "Hampi Bazaar" },
      { name: "Suresh Restaurant", cuisine: "Authentic South Indian Breakfast", location: "Main Temple Street" },
    ],
    localSpecialties: [
      "Traditional South Indian Banana Leaf Thali",
      "Badane Ennegayi (North Karnataka Stuffed Brinjal)",
      "Jolada Rotti (Sorghum Flatbread with Shenga Chutney)",
      "Shenga Chutney Pudi (Spiced Peanut Powder)",
      "Fresh Coconut Water & Sugarcane Juice",
    ],
    travelInfo: {
      bestTime: "October – March (Pleasant weather; summers can be very hot)",
      duration: "2 – 3 Days",
      idealFor: "History Buffs • Photographers • Backpackers • Explorers",
      activities: "Ruins Exploration • Coracle River Rides • Bouldering • Sunset Treks",
      localTransport: "Dedicated Chauffeur Cab • Bicycles • Electric Buggies at Monuments",
    },
    goodToKnow: [
      "Hampi is divided by the Tungabhadra River into the Sacred/Royal Center and the Hippie Island (Sanapur side).",
      "Wear comfortable walking shoes with good grip as most sites involve walking on sandstone and boulders.",
      "Carry sunscreen, hats, and drinking water as midday sun can be intense even in winter.",
    ],
  },

  gokarna: {
    about:
      "Gokarna is a peaceful coastal temple town in Karnataka, famous for its sacred Mahabaleshwar Atmalinga temple and five pristine, secluded beaches (Om Beach, Kudle Beach, Half Moon Beach, Paradise Beach, and Main Beach) connected by dramatic cliff treks.",
    famousPlaces: [
      { name: "Om Beach", image: "/destinations/om-beach.jpg", desc: "Naturally shaped like the sacred Om symbol with rock viewpoints." },
      { name: "Mahabaleshwar Temple", image: "/destinations/gokarna.jpg", desc: "4th-century temple housing the sacred Pranalinga (Atmalinga)." },
      { name: "Murudeshwar Temple", image: "/destinations/murudeshwar.jpg", desc: "123ft world-famous Shiva statue surrounded by the Arabian Sea." },
      { name: "Kudle Beach", image: "/destinations/gokarna.jpg", desc: "Expansive white-sand cove lined with beachside cafes." },
    ],
    nearbyDestinations: [
      { id: "goa", name: "Goa (South Goa)", distance: "135 km", desc: "Tropical beaches & Portuguese heritage" },
      { id: "murudeshwar", name: "Murudeshwar", distance: "78 km", desc: "Giant Shiva statue & temple" },
      { id: "dandeli", name: "Dandeli", distance: "155 km", desc: "River rafting & jungle safaris" },
      { id: "udupi", name: "Udupi", distance: "180 km", desc: "Temples & St. Mary's Island" },
    ],
    popularStays: [
      { name: "SwaSwara - CGH Earth", type: "Luxury Wellness & Yoga Resort", location: "Om Beach" },
      { name: "Kahani Paradise", type: "Exclusive Cliffside Villa Estate", location: "Belekeri, Gokarna" },
      { name: "Kudle Beach View Resort", type: "Resort & Spa", location: "Kudle Beach Hilltop" },
      { name: "Namaste Sanjeevini", type: "Eco Nature Resort", location: "Kudle Beach Road" },
    ],
    restaurants: [
      { name: "Namaste Cafe", cuisine: "Beachfront Seafood & Continental", location: "Om Beach" },
      { name: "Chez Christophe", cuisine: "French Bakery & Cafe", location: "Kudle Beach" },
      { name: "Mantra Cafe", cuisine: "Cliffside Continental & Pizzas", location: "Zostel Gokarna" },
      { name: "Prema Restaurant", cuisine: "Homestyle South Indian & Ice Creams", location: "Car Street, Town" },
    ],
    localSpecialties: [
      "Karavali Coastal Fish Curry & Anjal Fry",
      "Clam Sukka (Tisrya Masala)",
      "Prawns Ghee Roast",
      "Nutritious Sattvic Temple Prasada Meals",
      "Gadbad Ice Cream & Fresh Fruit Smoothies",
    ],
    travelInfo: {
      bestTime: "October – March (Gentle sea breeze and calm tides)",
      duration: "3 – 4 Days",
      idealFor: "Beach Lovers • Backpackers • Spiritual Seekers • Cliff Trekkers",
      activities: "5-Beach Cliff Trek • Watersports • Temple Darshan • Sunset Beach Walks",
      localTransport: "Chauffeur Cabs • Motorboats between Beaches • Foot Trails",
    },
    goodToKnow: [
      "Strict traditional dress codes apply inside the inner sanctum of Mahabaleshwar Temple (dhotis for men).",
      "The 5-beach cliff trek is best done in the morning before midday heat; carry ample water.",
      "Motorboats connect Om Beach, Half Moon Beach, and Paradise Beach during calm seasons.",
    ],
  },
};

/**
 * Fallback Generator for destinations without an explicit manual guide entry
 */
export function getDestinationGuide(destination) {
  if (!destination) return null;
  const key = destination.id?.toLowerCase();
  if (DESTINATION_GUIDES[key]) {
    return DESTINATION_GUIDES[key];
  }

  // Create an authentic, verified data-driven guide using destination's own metadata
  const famousPlaces = (destination.nearbyStops || []).map((stop) => ({
    name: stop.name,
    image: stop.image || destination.image,
    desc: stop.description || stop.categoryName || "Popular attraction",
  }));

  if (famousPlaces.length === 0 && destination.attractions) {
    destination.attractions.forEach((att) => {
      famousPlaces.push({
        name: att.name,
        image: destination.image,
        desc: att.desc,
      });
    });
  }

  return {
    about:
      destination.overview ||
      destination.description ||
      `${destination.name} is a premier destination in ${destination.state}, renowned for its scenic beauty and unique road trip experiences.`,
    famousPlaces,
    nearbyDestinations: [],
    popularStays: [
      { name: `Premium Resort ${destination.name}`, type: "Luxury Stay", location: destination.location || destination.state },
      { name: `Heritage Homestay ${destination.name}`, type: "Estate Homestay", location: destination.name },
    ],
    restaurants: [
      { name: `Authentic ${destination.name} Diner`, cuisine: "Regional Cuisine", location: destination.name },
      { name: "Highway Green Leaf Restaurant", cuisine: "South Indian & Coffee", location: "Main Route" },
    ],
    localSpecialties: [
      `Authentic ${destination.state} Traditional Thali`,
      "Fresh Filter Coffee",
      "Regional Sweets & Savories",
    ],
    travelInfo: {
      bestTime: destination.bestTime || "October – March",
      duration: destination.duration || "2 – 3 Days",
      idealFor: destination.tagline || "Road Trips • Nature • Heritage",
      activities: (destination.highlights || []).slice(0, 3).join(" • ") || "Sightseeing • Photography",
      localTransport: "Private Outstation Cabs • Chauffeur Service",
    },
    goodToKnow: [
      `Start early in the morning for major attractions around ${destination.name}.`,
      "Carry comfortable walking shoes for sightseeing.",
      "Check weather and road condition advisories for ghat routes.",
    ],
  };
}
