import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Next 16's persisted runtime route cache can retain HTML/RSC pointing at old
// chunk hashes after a rebuild. Never carry rendered responses across builds.
// Compiler and fetch caches remain available for incremental compilation.
rmSync(fileURLToPath(new URL('../.next/server/route-cache', import.meta.url)), { recursive: true, force: true });
console.log('Cleared persisted runtime HTML/RSC cache before production build.');
