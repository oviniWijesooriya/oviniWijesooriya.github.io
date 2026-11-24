# Ovini Wijesooriya — Portfolio

An interactive, animated personal portfolio for Ovini Wijesooriya, Food Science & Technology undergraduate at the University of Peradeniya and Alfred Baur Gold Medalist (FAuRS 2026).

Built with **React + Vite**, **Framer Motion** for animation and **Lenis** for smooth scrolling.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # preview the production build
```

## Editing content

All text lives in **`src/data.js`**: contact links, stats, awards, the year-by-year wins, journey (leadership / industry / volunteering), education, projects and skills. Change it there and every section updates.

The portrait is `public/ovini.jpg`.

## Animations

- Intro preloader with a counter and curtain reveal
- Hero: letter-by-letter name, rotating roles, arch photo reveal with scroll parallax, spinning "Gold Medalist" badge, floating cards
- Custom cursor (desktop only) and magnetic buttons
- Marquee strips that speed up and reverse with scroll direction
- Scroll reveals, word-by-word headings and count-up stats
- 3D tilt cards with a moving glare (Spotlight, Projects)
- Year and journey tabs with a sliding pill and animated card swaps
- Education timeline that fills as you scroll
- Scroll progress bar and a nav that hides on scroll-down

All motion respects the visitor's "reduce motion" setting.

## Deploying

It's a static site. On Vercel or Netlify use build command `npm run build` and output directory `dist`.
