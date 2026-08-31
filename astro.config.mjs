// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://jadenchung.dev',

  // Astro 7 ships the Rust "Sätteri" processor by default, which takes
  // mdast/hast plugins rather than remark/rehype ones. remark-math and
  // rehype-katex are unified plugins, so we opt back into unified. KaTeX
  // renders to plain HTML at build time -- no math JS reaches the browser.
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    // Shiki defaults to a dark theme, which fights the off-white page.
    shikiConfig: { theme: 'github-light' },
  },

  // Crimson Pro, downloaded and self-hosted at build time.
  // Astro emits the @font-face rules, preload links and metric-matched
  // fallbacks; nothing is requested from Google at runtime.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Crimson Pro',
      cssVariable: '--font-crimson-pro',
      // Without this Astro metric-matches against Arial and appends
      // sans-serif to the variable, so a failed font load would drop this
      // serif site onto a sans. Georgia is the closest widely-installed serif.
      fallbacks: ['Georgia', 'Times New Roman', 'serif'],
      weights: [400, 600],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
    },
  ],
});
