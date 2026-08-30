// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  site: 'https://jadenchung.dev',

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
