import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Every collection is just a folder of markdown files. Add a file, it shows up.

const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// One entry per trip. The photos themselves are not listed here -- they live in
// src/assets/photos/<same-filename-as-this-file>/ and are picked up automatically.
const photography = defineCollection({
  loader: glob({ base: './src/content/photography', pattern: '**/*.md' }),
  schema: z.object({
    place: z.string(),      // "NYC — Brooklyn + Flushing"
    tripDates: z.string(),  // "March 21 – 25, 2026"
    date: z.coerce.date(),  // sort key, newest first
  }),
});

// One entry per fit. Photos are optional: drop them in src/assets/closet/<slug>/.
const closet = defineCollection({
  loader: glob({ base: './src/content/closet', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    pieces: z.array(
      z.object({
        brand: z.string(),
        item: z.string(),
        note: z.string().optional(),
        link: z.url().optional(),
      }),
    ),
  }),
});

export const collections = { writing, photography, closet };
