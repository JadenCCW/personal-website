/**
 * Turns a folder of full-size scans into web-sized WebP, one output folder per album.
 *
 *   npm run photos              # read from the default source below
 *   npm run photos -- --force   # re-encode files that already exist
 *   npm run photos -- --src "D:/some/other/folder"
 *
 * Source layout: one folder per trip. The folder name is the album; a folder
 * called "ignore" is skipped. Output goes to src/assets/photos/<slug>/, which is
 * where PhotoGrid.astro looks. Sharp strips EXIF (including GPS) by default.
 */

import sharp from 'sharp';
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_SRC = 'C:/Users/goku7/Pictures/film pics';
const OUT_ROOT = 'src/assets/photos';
const MAX_EDGE = 2000;
const QUALITY = 82;
const SKIP_DIRS = new Set(['ignore']);
const IMAGE_RE = /\.(png|jpe?g|tiff?)$/i;

// Folder names carry the place and the dates; the slug is the URL. Anything not
// listed here gets a slug derived from its folder name.
const SLUGS = {
  'NYC - Brooklyn + Flushing (March 21- 25, 2026)': 'nyc-brooklyn-flushing',
  'Point Lobos State Natural Reserve (March 7, 2026)': 'point-lobos',
  'Seoul, South Korea (Dec 23, 2025 - Dec 30, 2025)': 'seoul',
  'Tanaka Farms Irvine Dec 20, 2025': 'tanaka-farms',
};

function slugify(name) {
  return name
    .replace(/\(.*?\)/g, '')        // drop the parenthetical date
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const src = arg('--src', DEFAULT_SRC);
const force = process.argv.includes('--force');

const albums = (await readdir(src, { withFileTypes: true }))
  .filter((e) => e.isDirectory() && !SKIP_DIRS.has(e.name.toLowerCase()));

if (albums.length === 0) {
  console.error(`No album folders found in ${src}`);
  process.exit(1);
}

let written = 0;
let skipped = 0;
let bytesIn = 0;
let bytesOut = 0;

for (const album of albums) {
  const slug = SLUGS[album.name] ?? slugify(album.name);
  const inDir = path.join(src, album.name);
  const outDir = path.join(OUT_ROOT, slug);
  await mkdir(outDir, { recursive: true });

  const files = (await readdir(inDir)).filter((f) => IMAGE_RE.test(f)).sort();
  console.log(`\n${album.name}\n  -> ${outDir}  (${files.length} photos)`);

  for (const file of files) {
    const inPath = path.join(inDir, file);
    const outPath = path.join(outDir, `${path.parse(file).name.toLowerCase()}.webp`);

    if (!force) {
      try {
        await stat(outPath);
        skipped++;
        continue;
      } catch {
        // not there yet, encode it
      }
    }

    const info = await sharp(inPath)
      .rotate() // bake in EXIF orientation BEFORE metadata is stripped
      .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(outPath);

    const inSize = (await stat(inPath)).size;
    bytesIn += inSize;
    bytesOut += info.size;
    written++;

    const mb = (n) => (n / 1024 / 1024).toFixed(1);
    console.log(
      `  ${file}  ${mb(inSize)}MB -> ${mb(info.size)}MB  (${info.width}x${info.height})`,
    );
  }
}

const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(
  `\n${written} written, ${skipped} already present.` +
    (written ? `  ${mb(bytesIn)}MB -> ${mb(bytesOut)}MB` : ''),
);
if (skipped && !force) console.log('Re-encode existing files with: npm run photos -- --force');
