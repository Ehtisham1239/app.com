import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// This installed Next version retained stale HTML/CSS references across cached
// builds. Clearing only server/route-cache was insufficient after layout/font
// changes. Production builds start clean; dev compilation stays incremental.
rmSync(fileURLToPath(new URL('../.next', import.meta.url)), { recursive: true, force: true });
console.log('Cleared generated Next build output for a consistent production release.');
