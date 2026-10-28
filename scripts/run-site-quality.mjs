import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { auditOrigin } from './lib/audit-origin.mjs';

const remote = process.argv.find(arg => /^https?:\/\//.test(arg));
const port = remote ? null : await new Promise((resolve, reject) => {
  const socket = createServer();
  socket.once('error', reject);
  socket.listen(0, '127.0.0.1', () => { const port = socket.address().port; socket.close(() => resolve(port)); });
});
const base = auditOrigin(remote || `http://127.0.0.1:${port}`).origin;
const output = process.env.OQC_QA_OUTPUT || 'artifacts/site-quality';
mkdirSync(output, { recursive: true });
process.env.NO_PROXY = process.env.no_proxy = [process.env.NO_PROXY, 'localhost', '127.0.0.1'].filter(Boolean).join(',');
let server, logs = '';
const stopServer = () => {
  if (!server?.pid) return;
  try { process.platform === 'win32' ? server.kill('SIGTERM') : process.kill(-server.pid, 'SIGTERM'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
};
process.once('SIGINT', () => { stopServer(); process.exit(130); });
process.once('SIGTERM', () => { stopServer(); process.exit(143); });
const run = (script, args) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [script, ...args], { env: process.env, stdio: 'inherit' });
  child.on('error', reject);
  child.on('exit', code => code === 0 ? resolve() : reject(Error(`${script} exited ${code}`)));
});
try {
  if (!remote) {
    // Server and browser must be children of the same runner: managed execution
    // environments can put separate shell calls in different network namespaces.
    server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], { env: process.env, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
    server.stdout.on('data', chunk => { logs += chunk; }); server.stderr.on('data', chunk => { logs += chunk; });
    let ready = false;
    for (let i = 0; i < 60; i++) {
      if (server.exitCode !== null) throw Error(`QA server stopped: ${logs}`);
      try { if ((await fetch(base + '/robots.txt')).ok) { ready = true; break; } } catch { /* Startup is bounded. */ }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    if (!ready) throw Error(`QA server did not become ready: ${logs}`);
  }
  if (process.argv.includes('--search-check')) {
    await run('scripts/search-readiness-smoke.mjs', [base, `${output}/search`]);
  } else if (process.argv.includes('--font-check')) {
    await run('scripts/font-browser-smoke.mjs', [base, `${output}/fonts`]);
  } else if (process.argv.includes('--performance-check')) {
    await run('scripts/public-performance-smoke.mjs', [base, `${output}/performance`]);
  } else if (process.argv.includes('--google-vendor-check')) {
    await run('scripts/analytics-install-smoke.mjs', [base, 'G-57TGPTDNT4', `${output}/google-vendor`, '--real-google-script']);
  } else {
    await run('scripts/site-quality-browser.mjs', [base, output]);
    await run('scripts/blog-browser-smoke.mjs', [base, `${output}/blog`]);
    await run('scripts/analytics-install-smoke.mjs', [base, 'G-57TGPTDNT4', `${output}/analytics`]);
    await run('scripts/seo-agent-audit.mjs', [base, `${output}/seo`]);
  }
} finally {
  stopServer();
  writeFileSync(`${output}/server.log`, logs);
}
