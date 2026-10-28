// Reproducible Lighthouse lab checks. Local runs use inert vendor stubs and
// seed content; pass the production URL for a real remote lab measurement.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import { auditOrigin } from './lib/audit-origin.mjs';

const remote = process.argv.find(arg => /^https?:\/\//.test(arg));
const out = process.env.OQC_QA_OUTPUT || 'artifacts/performance';
mkdirSync(out, { recursive: true });
const port = remote ? null : await new Promise(resolve => {
  const socket = createServer();
  socket.listen(0, '127.0.0.1', () => {
    const port = socket.address().port;
    socket.close(() => resolve(port));
  });
});
const base = auditOrigin(remote || `http://127.0.0.1:${port}`).origin;
let server, logs = '';
const results = [];
try {
  if (!remote) {
    server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], { stdio: ['ignore', 'pipe', 'pipe'] });
    server.stdout.on('data', chunk => { logs += chunk; });
    server.stderr.on('data', chunk => { logs += chunk; });
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null) throw Error(`Server stopped: ${logs}`);
      try { if ((await fetch(base + '/robots.txt')).ok) { ready = true; break; } } catch { /* bounded startup */ }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    if (!ready) throw Error(`Server startup timed out: ${logs}`);
  }
  const chrome = process.env.CHROMIUM_PATH || chromium.executablePath();
  for (const device of ['mobile', 'desktop']) {
    // chrome-launcher is supplied by Lighthouse and exposes the CDP port.
    const { launch } = await import('chrome-launcher');
    const launched = await launch({ chromePath: chrome, chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'] });
    try {
      const result = await lighthouse(base, {
        port: launched.port,
        output: ['json', 'html'],
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        ...(remote ? {} : { blockedUrlPatterns: ['*googletagmanager.com/*', '*google-analytics.com/*', '*app.hatchium.ai/*', '*/_vercel/speed-insights/*'] }),
      }, device === 'desktop' ? desktopConfig : undefined);
      const { lhr, report } = result;
      if (lhr.runtimeError) throw Error(JSON.stringify(lhr.runtimeError));
      writeFileSync(`${out}/${device}.json`, report[0]);
      writeFileSync(`${out}/${device}.html`, report[1]);
      const metrics = Object.fromEntries(['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'].map(id => [id, lhr.audits[id].numericValue]));
      const summary = { device, url: base, fetchTime: lhr.fetchTime, lighthouseVersion: lhr.lighthouseVersion, mode: remote ? 'remote lab' : 'local lab; vendor scripts blocked; seed content', scores: Object.fromEntries(Object.entries(lhr.categories).map(([id, value]) => [id, Math.round(value.score * 100)])), metrics, diagnostics: Object.values(lhr.audits).filter(a => a.score !== null && a.score < 1).map(a => ({ id: a.id, title: a.title, value: a.displayValue })) };
      results.push(summary);
      console.log(JSON.stringify(summary, null, 2));
    } finally { await launched.kill(); }
  }
} finally {
  server?.kill();
  writeFileSync(`${out}/server.log`, logs);
  writeFileSync(`${out}/summary.json`, JSON.stringify(results, null, 2));
}
