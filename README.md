# Zenera Trips — Marketing Website

Production-ready marketing site for **Zenera Trips**, Bangalore's outstation group vehicle booking platform.

## Tech Stack
- **React 18** + **Vite 5**
- **Tailwind CSS 3** (custom brand tokens)
- **Framer Motion 11** (scroll reveals, hero animations)
- Deploy on **Vercel**

## Getting Started

```bash
npm install
npm run dev       # localhost:5173
npm run build     # production build → dist/
npm run preview   # preview production build
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel deploy
```

Or connect the GitHub repo at vercel.com → it auto-detects Vite.

## Architecture

```
src/
├── App.jsx                  Root — imports all sections
├── main.jsx                 Entry point
├── index.css                Tailwind + global animations
├── constants/
│   └── index.js             Single source of truth for all content
└── components/
    ├── Navbar.jsx            Sticky nav, mobile hamburger
    ├── Hero.jsx              Hero section with stats grid
    ├── RoadScene.jsx         Animated SVG road with cars
    ├── Fleet.jsx             10 vehicle cards
    ├── Routes.jsx            6 popular route cards
    ├── WhyZenera.jsx         4 feature cards
    ├── Testimonials.jsx      3 testimonial cards
    ├── AppCTA.jsx            App download section (orange)
    └── Footer.jsx            4-column footer
```

## Updating Content

All content lives in **`src/constants/index.js`** — no need to touch components for content changes.

- Add/edit vehicles → `VEHICLES` array
- Add/edit routes → `ROUTES` array
- Update WhatsApp number → `LINKS.whatsapp`
- Update Play Store link → `LINKS.playStore`
- Update stats → `STATS` array

## Brand Tokens

| Token | Value |
|---|---|
| Charcoal | `#1A1A1A` |
| Orange | `#E87B2C` |
| Cream | `#F7F4F0` |
| Dark | `#111111` |
| Font (heading) | Syne 800 |
| Font (body) | Inter |
