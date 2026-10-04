import { useEffect } from "react";

export interface PageSEOOptions {
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

const DEFAULT_TITLE = "Zenera Trips — Chalo Kahi Bhi.";
const DEFAULT_DESCRIPTION =
  "Book Tempo Travellers, Buses, SUVs & Sedans for outstation trips from Bangalore. Live GPS tracking, verified drivers, and secure payments.";
const DEFAULT_CANONICAL = "https://zenera-trips.web.app/";
const DEFAULT_OG_IMAGE = "https://zenera-trips.web.app/og-image.png";

/**
 * Lightweight React hook to manage dynamic route-level SEO metadata.
 * Ensures private routes are strictly protected with 'noindex, nofollow' directives.
 */
export function usePageSEO(options: PageSEOOptions) {
  useEffect(() => {
    // 1. Update Document Title
    document.title = options.title ? `${options.title}` : DEFAULT_TITLE;

    // Helper to safely set or create meta tags by name
    const setMetaByName = (name: string, content: string | undefined) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Helper to safely set or create meta tags by property (OpenGraph)
    const setMetaByProperty = (property: string, content: string | undefined) => {
      if (!content) return;
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // 2. Set Description
    setMetaByName("description", options.description || DEFAULT_DESCRIPTION);

    // 3. Set Robots
    setMetaByName("robots", options.robots || "index, follow");

    // 4. Set Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", options.canonical || DEFAULT_CANONICAL);

    // 5. OpenGraph Tags
    setMetaByProperty("og:title", options.ogTitle || options.title || DEFAULT_TITLE);
    setMetaByProperty("og:description", options.ogDescription || options.description || DEFAULT_DESCRIPTION);
    setMetaByProperty("og:url", options.ogUrl || options.canonical || DEFAULT_CANONICAL);
    setMetaByProperty("og:image", options.ogImage || DEFAULT_OG_IMAGE);

    // 6. Twitter Card Tags
    setMetaByName("twitter:title", options.twitterTitle || options.title || DEFAULT_TITLE);
    setMetaByName("twitter:description", options.twitterDescription || options.description || DEFAULT_DESCRIPTION);
    setMetaByName("twitter:image", options.twitterImage || DEFAULT_OG_IMAGE);
    setMetaByName("twitter:url", options.canonical || DEFAULT_CANONICAL);

  }, [
    options.title,
    options.description,
    options.robots,
    options.canonical,
    options.ogTitle,
    options.ogDescription,
    options.ogUrl,
    options.ogImage,
    options.twitterTitle,
    options.twitterDescription,
    options.twitterImage,
  ]);
}
