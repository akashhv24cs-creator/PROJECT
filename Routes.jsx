import { motion } from "framer-motion";
import { ROUTES } from "./index.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Routes() {
  return (
    <section id="routes" className="bg-theme-bg py-24 lg:py-32 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-orange mb-4">
            Popular Routes
          </span>
          <h2 className="font-heading font-extrabold text-4xl lg:text-5xl text-theme-text-primary leading-tight">
            Where people
            <br />
            are going.
          </h2>
        </motion.div>

        {/* Routes Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          {ROUTES.map((route, idx) => (
            <motion.div
              key={`${route.from}-${route.to}`}
              variants={fadeUp}
              className="flex flex-col p-6 rounded-2xl border border-theme-border bg-theme-card shadow-theme-card hover:border-orange/50 hover:shadow-xl hover:shadow-orange/5 transition-all duration-300 group cursor-default"
            >
              {/* Route header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading font-bold text-xl text-theme-text-primary">{route.from}</span>
                    <span className="text-orange text-lg font-bold">→</span>
                    <span className="font-heading font-bold text-xl text-orange">{route.to}</span>
                  </div>
                  <div className="flex items-center gap-3 text-theme-text-muted text-xs font-medium">
                    <span className="flex items-center gap-1">
                      {route.distance}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      {route.duration}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className="inline-block text-orange text-xs font-semibold px-2.5 py-1 rounded-full bg-orange/10 border border-orange/20">
                    {route.tag || "Popular Route"}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-theme-border mb-5" />

              {/* On the way */}
              <div className="mb-4">
                <p className="text-theme-text-muted text-[10px] uppercase tracking-widest font-semibold mb-2">
                  Places on the way
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {route.onTheWay.map((place) => (
                    <span
                      key={place}
                      className="text-xs px-2.5 py-1 rounded-full border border-theme-border text-theme-text-secondary bg-theme-surface-secondary"
                    >
                      {place}
                    </span>
                  ))}
                </div>
              </div>

              {/* At destination */}
              <div>
                <p className="text-theme-text-muted text-[10px] uppercase tracking-widest font-semibold mb-2">
                  At {route.to}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {route.atDestination.map((place) => (
                    <span
                      key={place}
                      className="text-xs px-2.5 py-1 rounded-full bg-orange/10 border border-orange/20 text-orange font-medium group-hover:border-orange/40 transition-colors duration-200"
                    >
                      {place}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
