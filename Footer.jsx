import { Link } from "react-router-dom";
import { LINKS } from "./index.js";

export default function Footer() {
  return (
    <footer id="about" className="bg-[#0B1522] dark:bg-[#050D17] text-white border-t border-[#1E2E42] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="scroll-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Brand Column (5 cols) */}
          <div className="scroll-reveal lg:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-white/10 border border-white/20">
                <img
                  src="/favicon.svg"
                  alt="Zenera Trips Logo"
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight group-hover:text-orange transition-colors">
                Zenera Trips
              </span>
            </Link>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Next-generation travel-tech platform providing reliable outstation cabs, tempo travellers, luxury buses, and curated holiday getaways. Safe, comfortable, and always on time.
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>24/7 Roadside Assistance</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                <span>100% Verified Drivers</span>
              </span>
            </div>
          </div>

          {/* Column 2: Navigation (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-orange transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-orange transition-colors">
                  Bookings
                </Link>
              </li>
              <li>
                <a href="#destinations" className="hover:text-orange transition-colors">
                  Destinations
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-orange transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-orange transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Travel Services (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Services
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/book" className="hover:text-orange transition-colors">
                  Outstation Cabs
                </Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-orange transition-colors">
                  Tempo Travellers
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-orange transition-colors">
                  Tour Packages
                </Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-orange transition-colors">
                  Corporate Rentals
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support & Legal (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Support & Legal
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <a
                  href={LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Help Center & Support</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-orange transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-orange transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#refund" className="hover:text-orange transition-colors">
                  Refund & Cancellation Policy
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright bar */}
        <div className="pt-8 mt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Zenera Trips. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <span>Built for modern travelers</span>
            <span>·</span>
            <span>Bangalore, Karnataka</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

