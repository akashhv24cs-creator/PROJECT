import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useFleetPricing } from "./src/services/fleet.service";

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Fleet() {
  const navigate = useNavigate();
  const { fleets, loading, error, refresh } = useFleetPricing();

  return (
    <section id="fleet" className="bg-theme-surface-secondary py-24 lg:py-32 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="mb-14 lg:mb-18"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-orange mb-4">
            Fleet
          </span>
          <h2 className="font-heading font-extrabold text-4xl lg:text-5xl text-theme-text-primary leading-tight">
            Every vehicle.
            <br />
            One platform.
          </h2>
        </motion.div>

        {/* Vehicle Grid / Loading / Error */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-between p-5 rounded-2xl border border-theme-border bg-theme-card animate-pulse space-y-3"
              >
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </p>
            <button
              type="button"
              onClick={() => refresh()}
              className="px-4 py-2 rounded-xl bg-orange hover:bg-orangeLight text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Retry
            </button>
          </div>
        ) : fleets.length === 0 ? (
          <div className="p-8 rounded-2xl border border-theme-border bg-theme-card text-center text-sm text-theme-text-muted">
            No fleet options available.
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {fleets.map((v) => (
              <motion.div
                key={v.id || v.name}
                variants={fadeUp}
                onClick={() => navigate(`/book?vehicle=${encodeURIComponent(v.name)}`)}
                className="relative flex flex-col items-center justify-between p-5 rounded-2xl border border-theme-border bg-theme-card shadow-theme-card hover:border-orange hover:shadow-lg hover:shadow-orange/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                {/* Tag */}
                {v.tag && (
                  <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm ${
                    v.tag === "Most Popular"
                      ? "bg-orange text-white"
                      : "bg-theme-surface-elevated text-theme-text-primary border border-theme-border"
                  }`}>
                    {v.tag}
                  </span>
                )}

                {/* Icon */}
                <span className="text-4xl mb-3 mt-1 group-hover:scale-110 transition-transform duration-200">
                  {v.icon || "🚗"}
                </span>

                {/* Name */}
                <h3 className="font-heading font-bold text-theme-text-primary text-sm text-center leading-tight mb-1.5">
                  {v.name}
                </h3>

                {/* Seats */}
                <p className="text-theme-text-muted text-xs mb-3 text-center">{v.seats}</p>

                {/* Price */}
                <div className="w-full text-center py-1.5 px-2 rounded-lg bg-theme-surface-secondary group-hover:bg-orange/10 transition-colors duration-200">
                  <span className="font-heading font-bold text-theme-text-primary group-hover:text-orange text-sm transition-colors duration-200">
                    ₹{v.pricePerKm || v.backendRatePerKm}/km
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Bottom CTA note */}
        <motion.p
          className="text-center text-theme-text-muted text-sm mt-10 font-body"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          All prices are per km · Toll & state tax extra · Book online for exact verified estimates
        </motion.p>
      </div>
    </section>
  );
}
