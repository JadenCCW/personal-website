# jadenchung.dev

Astro 7 static site. Minimalist/brutalist, modelled on krishmatta.net and
harrycodes.com. Crimson Pro throughout. Four sections: home, writing,
photography, closet.

## Ground rules

- **No JavaScript ships to the browser.** Don't add a framework integration, a
  theme toggle, or a client component without being asked.
- **One stylesheet**, `src/styles/global.css`. No Tailwind, no CSS modules, no
  `<style>` blocks in components. If a page needs a new look, add a class there.
- **No cards, shadows, gradients, or hover animations.** Separation is done with
  whitespace and heading hierarchy.
- Section headings are lowercase and muted; body prose is sentence case.
- Dates are dotted (`2026.03.21`) on index rows via `dotted()` in `src/lib/date.ts`,
  and long-form (`March 21, 2026`) on entry pages via `longDate()`.

## Astro 7 specifics that bite

- Content config is `src/content.config.ts`, **not** `src/content/config.ts`.
- Import `z` from `astro/zod`, **not** from `astro:content`.
- Render with `await render(entry)` from `astro:content`. `entry.render()` is gone.
- Entry identity is `entry.id`. `entry.slug` is gone.
- `import.meta.glob()` needs a **literal** pattern. `PhotoGrid.astro` globs all of
  `src/assets` once and filters by prefix — that's why, don't "fix" it.
- The compiler collapses whitespace between inline elements, so a literal `·`
  typed between two `<a>`s is unreliable. Use `class="dots"`, which draws the
  separator with `::before`.
- Font fallbacks belong in `astro.config.mjs`, not in CSS — Astro appends its own
  generic family to `--font-crimson-pro`, which would shadow anything listed after
  the variable.
- Astro 7 replaced remark/unified with the Rust **Sätteri** processor, which takes
  mdast/hast plugins, not remark/rehype ones. We opt back into unified in
  `astro.config.mjs` so `remark-math` + `rehype-katex` work. Don't "simplify" that
  away — math would silently stop rendering.
- The dev server frequently serves a **stale content-collection cache**: a new or
  edited entry shows up in `npm run build` but not on localhost. Restart with
  `npx astro dev --force`. `astro dev` also has `stop`/`status`/`logs` subcommands
  and a `--background` flag.

## Math and diagrams in posts

- Math is `$$…$$` (display) or `$…$` (inline), rendered by KaTeX **at build time** —
  no math JS reaches the browser. The stylesheet is imported in
  `src/pages/writing/[...slug].astro`, so only posts pay for it.
- Diagrams are hand-written inline SVG, not mermaid — mermaid would need either a
  headless-Chromium build dependency or client JS. All diagram styling lives in
  `global.css` under `.diagram`, so the markup in a post stays geometry only and
  inherits the site's type and palette.
- **A blank line inside raw HTML in markdown ends the HTML block**, and everything
  after it gets parsed as prose. Keep an SVG contiguous — no blank lines between
  its elements — or its contents will spill out as text.
- Wrap a diagram in `<div class="diagram-wrap">`. An SVG scaled to a phone shrinks
  14px labels to ~7px; the wrapper keeps the diagram at natural size and scrolls it
  instead.

## Content

Adding a post, album, or fit is a matter of dropping a markdown file in
`src/content/<collection>/` — see README.md for the frontmatter shapes. Photos
attach by folder name matching the markdown filename; nothing is listed in
frontmatter.
