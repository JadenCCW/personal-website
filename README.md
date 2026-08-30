# jadenchung.dev

Static site built with [Astro](https://astro.build). No JavaScript ships to the
browser, and there is one stylesheet.

```bash
npm run dev       # http://localhost:4321
npm run build     # static output into dist/
npm run preview   # serve the built site
npm run photos    # re-encode photos from Pictures/film pics
```

Node 22.12+ is required (this machine has 24 LTS).

## Adding things

**A post** — drop a markdown file in `src/content/writing/`. The filename is the URL.

```markdown
---
title: "Something I thought about"
date: 2026-09-14
description: "One line, shown on the index. Optional."
draft: false
---

Body goes here.
```

**A photo album** — two steps:

1. Put the images in `src/assets/photos/<slug>/`. Any name, any order — they sort
   by filename.
2. Add `src/content/photography/<slug>.md` with the same slug:

```markdown
---
place: "Big Sur, California"
tripDates: "June 3 – 5, 2026"
date: 2026-06-03
---
```

The body is optional — leave it empty and the page is just photos.

**A fit** — add `src/content/closet/<slug>.md`:

```markdown
---
title: "fit 04"
date: 2026-09-01
pieces:
  - brand: "Brand"
    item: "The thing"
    note: "optional"
    link: "https://optional-url"
---
```

Photos are optional here too: `src/assets/closet/<slug>/`.

## Photos

`npm run photos` reads `C:/Users/goku7/Pictures/film pics`, skips the `ignore/`
folder, and writes 2000px WebP into `src/assets/photos/<slug>/`. Source folder
names map to slugs in `SLUGS` at the top of `scripts/optimize-photos.mjs` — add a
line there when you add a trip.

Sharp strips EXIF (including GPS) by default. Full-size scans and RAW/TIFF files
are gitignored, so only the web-sized copies are committed.

Flags: `-- --force` to re-encode existing files, `-- --src "D:/path"` for a
different source folder.

## Structure

```
src/
  content.config.ts     the three collection schemas
  styles/global.css     the entire design system
  layouts/Base.astro    html shell, nav, footer
  layouts/Prose.astro   Base + back link + title, for single entries
  components/           Nav, Section, PhotoGrid
  pages/                one file per route
  content/              markdown
  assets/               images, optimized at build time
```

## Deploying

Vercel auto-detects Astro — no adapter, no `vercel.json`. Push to GitHub, import
the repo, done. Change `site` in `astro.config.mjs` if the domain changes.

Optional adds, one line each: `npx astro add sitemap`, `npm i @astrojs/rss`.
