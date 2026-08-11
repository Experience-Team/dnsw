// Serialises every live/target fixture to JSON at
// public/wireframes/data/{record.id}.{live|target}.json, using each
// record's own `id` field as the slug (matches existing wireframe page
// filenames, e.g. mother-chus-taiwanese-gourmet).
//
// Run via `npm run fixtures:build` (compiles this + fixtures/ + types/ to
// CommonJS via contract/tsconfig.build.json, then runs the compiled JS with
// plain `node` — see contract/package.json for why that's CommonJS despite
// the repo root being an ESM package).

import * as fs from 'fs';
import * as path from 'path';
import type { ProductRecord } from '../types/product';

import { lionKingLive } from '../fixtures/event';
import { lionKingTarget } from '../fixtures/event-target';
import { interContinentalSydneyLive } from '../fixtures/accommodation';
import { interContinentalSydneyTarget } from '../fixtures/accommodation-target';
import { motherChusLive } from '../fixtures/food-and-drink';
import { motherChusTarget } from '../fixtures/food-and-drink-target';
import { tourFixturesLive } from '../fixtures/tour';
import { tourFixturesTarget } from '../fixtures/tour-target';
import { royalBotanicGardenLive } from '../fixtures/attraction';
import { royalBotanicGardenTarget } from '../fixtures/attraction-target';
import { sydneyHarbourKayaksLive } from '../fixtures/hire';
import { sydneyHarbourKayaksTarget } from '../fixtures/hire-target';

const liveRecords: ProductRecord[] = [
  lionKingLive,
  interContinentalSydneyLive,
  motherChusLive,
  ...tourFixturesLive,
  royalBotanicGardenLive,
  sydneyHarbourKayaksLive,
];

const targetRecords: ProductRecord[] = [
  lionKingTarget,
  interContinentalSydneyTarget,
  motherChusTarget,
  ...tourFixturesTarget,
  royalBotanicGardenTarget,
  sydneyHarbourKayaksTarget,
];

// __dirname at runtime is contract/.build/scripts/ (outDir mirrors rootDir's
// contract/scripts/ layout), so it's 3 levels below the repo root, not 2.
const outDir = path.resolve(__dirname, '../../../public/wireframes/data');
fs.mkdirSync(outDir, { recursive: true });

let count = 0;

for (const record of liveRecords) {
  fs.writeFileSync(path.join(outDir, `${record.id}.live.json`), JSON.stringify(record, null, 2) + '\n');
  count++;
}

for (const record of targetRecords) {
  fs.writeFileSync(path.join(outDir, `${record.id}.target.json`), JSON.stringify(record, null, 2) + '\n');
  count++;
}

console.log(`Generated ${count} fixture JSON files in ${outDir}`);
