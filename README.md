# Ovini Wijesooriya: Portfolio, Journal and Gallery

A multi-page personal site for Ovini Wijesooriya, Food Science & Technology undergraduate at the University of Peradeniya and Alfred Baur Gold Medalist (FAuRS 2026).

Built with **React + Vite + React Router**. Every page is also prerendered to its own HTML file at build time, so search engines and AI crawlers can read each page.

| Page | URL |
| --- | --- |
| Home | `/` |
| About | `/about/` |
| Achievements | `/achievements/` |
| Journal (blog) | `/blog/` and `/blog/<post>/` |
| Gallery | `/gallery/` and `/gallery/<event>/` |

## Admin dashboard (`/admin/`)

A dashboard with a left sidebar: **Overview**, **Journal**, **Gallery** and **Site details**. Every save is a commit to this repository, which redeploys the site in a few minutes.

**First visit on a device:** choose an admin username and password and paste a [fine-grained GitHub token](https://github.com/settings/personal-access-tokens/new) (only this repository, **Contents: Read and write**, with an expiry date). After that you log in with just the username and password.

How the login works: there is no server. The token is encrypted with your password and stored in that browser only. This protects the token on the device; it is not a shared account, so each device is set up once. If you forget the password, choose "Set up this device again" and paste a token. Delete the token on GitHub if it ever leaks.

After editing in the dashboard, run `git pull` before changing files on your computer.

## Photos from Google Drive

Original photos live in the Drive folder set in `src/content/drive.json`. The folder must be shared as **Anyone with the link: Viewer**.

```
PORTFOLIO/
  faurs-2026/          <- named after the event folder (or the event title)
    01.jpg
    02.jpg
  nova-25/
    group.jpg
```

Each build copies the photos into the site at 1600px and 800px, so visitors never load from Drive. The site rebuilds on every push, once a day, and when you press **Publish Drive photos** in the dashboard. To fetch them locally, run `npm run sync:photos`.

Without a `GOOGLE_API_KEY` repository secret the build reads the public folder page, which Google could change. Adding a Drive API key makes it use the official API. If a sync fails during a deploy, the deploy stops and the live site stays as it was.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build + prerendered pages in dist/
npm run preview   # serve the production build
```

## Add a blog post

Create a Markdown file in `src/content/posts/`. The file name becomes the URL (`my-post.md` is `/blog/my-post/`).

```markdown
---
title: Presenting at the symposium
date: 2026-12-05
category: Events attended
event: faurs-2026
summary: One or two sentences shown in lists and search results.
---
Write the post in Markdown. Use `##` for headings, `-` for lists, `**bold**`, and `[links](https://...)`.
```

- `date` is `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. Newest posts appear first.
- `category` creates a filter button automatically (use the same spelling to group posts).
- `event` is optional. Use the event's folder name to link the post to that event's gallery.
- `order` is optional and breaks ties between posts with the same date (higher first).
- `draft: true` keeps a post (or event) off the website.

## Add an event gallery

1. Create a folder `src/content/events/<event-name>/` (the folder name is the URL).
2. Add `index.md` with the event details:

   ```markdown
   ---
   title: FAuRS 2026
   date: 2026
   place: Faculty of Agriculture, University of Peradeniya
   host: Faculty of Agriculture, University of Peradeniya
   category: Research
   summary: One or two sentences about the event.
   cover: group-photo.jpg
   ---
   A longer description, in Markdown.
   ```

3. Drop the photos (`.jpg`, `.png`, `.webp`) into the same folder. They appear in the gallery automatically, sorted by file name. Name them `01.jpg`, `02.jpg`, ... to control the order.

- `cover` is optional and picks the card image; otherwise the first photo is used. Events without photos show generated cover art and "Photos coming soon".
- Resize photos to about 2000 px on the long edge before adding them, so the site stays fast.

## Other content

Home and about text, awards, experience, education, projects and contact details live in `src/content/site.json`. The portrait is `public/ovini.jpg`. The forms in the dashboard are described in `src/admin/schema.js`. Search-engine profile data is in `src/lib/seo-data.js`.

## SEO

`npm run build` runs `scripts/prerender.mjs`, which writes a separate HTML file for every page with its own title, description, canonical URL, Open Graph tags and JSON-LD, plus `sitemap.xml`, `404.html` and the page list in `llms.txt`. Page metadata is defined in `src/lib/seo-data.js`.

## Deploying

GitHub Actions (`.github/workflows/deploy.yml`) builds and publishes `dist/` to GitHub Pages on every push to `master`. The custom domain is set in `public/CNAME`.
