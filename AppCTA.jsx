import { motion } from "framer-motion";
import { APP_FEATURES, LINKS } from "./index.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function AppCTA() {
  return (
    <section className="bg-orange py-24 lg:py-32 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* Left — CTA copy & badges */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.span variants={fadeUp} className="inline-block text-xs font-semibold tracking-widest uppercase text-white/60 mb-5">
              Get the App
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className="font-heading font-extrabold text-5xl lg:text-6xl text-white leading-tight mb-6"
            >
              Book in
              <br />
              minutes.
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="font-body text-white/75 text-lg leading-relaxed mb-10 max-w-md"
            >
              Download the Zenera Trips app and book your group vehicle in under 5 minutes.
              Live tracking, instant confirmation, secure payments.
            </motion.p>

            {/* Store badges */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <a
                href={LINKS.playStore}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white text-charcoal font-semibold hover:bg-white/90 transition-all duration-200 shadow-xl shadow-black/20 group"
              >
                <svg className="w-7 h-7 text-charcoal" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.18 23.76c.41.22.87.24 1.3.06l12.44-7.16-2.84-2.84L3.18 23.76zM20.44 10.54l-2.94-1.7-3.18 3.18 3.18 3.18 2.96-1.72c.84-.48.84-1.96-.02-1.94zM1.5.78C1.2 1.1 1 1.6 1 2.22v19.56c0 .62.2 1.12.52 1.44l.08.06 10.96-10.96v-.24L1.5.78zM4.48.18l12.44 7.18-2.84 2.84L3.18.24C3.62.06 4.07.08 4.48.18z"/>
                </svg>
                <div>
                  <div className="text-charcoal/50 text-[10px] leading-none">GET IT ON</div>
                  <div className="text-charcoal text-base font-bold leading-tight">Google Play</div>
                </div>
              </a>

              <div className="inline-flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 border-white/30 text-white cursor-not-allowed opacity-60">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <div className="text-white/50 text-[10px] leading-none">COMING SOON</div>
                  <div className="text-white text-base font-bold leading-tight">App Store</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — feature list */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <div className="space-y-4">
              {APP_FEATURES.map((f, idx) => (
                <motion.div
                  key={f.text}
                  variants={fadeUp}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-colors duration-200"
                >
                  <span className="text-2xl flex-shrink-0">{f.icon}</span>
                  <span className="font-body text-white font-medium text-base">{f.text}</span>
                  <svg className="w-4 h-4 text-white/40 ml-auto flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
