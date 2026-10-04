import { useEffect, useRef } from "react";

/**
 * ZENERA TRIPS — Global Scroll Reveal IntersectionObserver Engine
 * 
 * Specifications:
 * - IntersectionObserver with 10% threshold and rootMargin
 * - Animates once per page load (unobserves on reveal)
 * - Zero expensive window scroll listeners
 * - Respects prefers-reduced-motion: reduce
 * - Handles dynamically rendered routes/components via MutationObserver
 */

let globalObserver = null;

function getGlobalObserver() {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!globalObserver) {
    globalObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            // Animate once per page load
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -35px 0px",
      }
    );
  }

  return { observer: globalObserver, prefersReducedMotion };
}

/**
 * Global function to scan and observe all .scroll-reveal and .scroll-reveal-scale elements in the DOM
 */
export function initScrollReveal() {
  if (typeof window === "undefined") return;

  const result = getGlobalObserver();
  if (!result) return;
  const { observer, prefersReducedMotion } = result;

  const elements = document.querySelectorAll(
    ".scroll-reveal:not(.is-revealed), .scroll-reveal-scale:not(.is-revealed)"
  );

  elements.forEach((el) => {
    if (prefersReducedMotion) {
      el.classList.add("is-revealed");
    } else {
      observer.observe(el);
    }
  });
}

/**
 * React hook to automatically observe a specific element ref or child elements
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;

    const result = getGlobalObserver();
    if (!result) {
      el.classList.add("is-revealed");
      return;
    }

    const { observer, prefersReducedMotion } = result;

    if (prefersReducedMotion) {
      el.classList.add("is-revealed");
      return;
    }

    // Add scroll-reveal class if not already present
    if (!el.classList.contains("scroll-reveal") && !el.classList.contains("scroll-reveal-scale")) {
      el.classList.add("scroll-reveal");
    }

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [options.delay]);

  return ref;
}

/**
 * Auto-initializer hook to mount in root App or pages
 */
export function useGlobalScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial scan
    initScrollReveal();

    // Observe dynamically mounted components (DOM mutations)
    const mutationObserver = new MutationObserver(() => {
      initScrollReveal();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
    };
  }, []);
}

export default useScrollReveal;
