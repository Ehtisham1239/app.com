import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const port = '3017', base = `http://127.0.0.1:${port}`;
process.env.NO_PROXY = [process.env.NO_PROXY, 'localhost', '127.0.0.1'].filter(Boolean).join(',');
process.env.no_proxy = process.env.NO_PROXY;
const env = { ...process.env };
let logs = '';
mkdirSync('artifacts/mobile-visual-smoke', { recursive: true });
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', port], { env, stdio: ['ignore', 'pipe', 'pipe'] });
server.stdout.on('data', chunk => { logs += chunk; });
server.stderr.on('data', chunk => { logs += chunk; });
const run = (script, args = []) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [script, ...args], { env, stdio: 'inherit' });
  child.on('exit', code => code === 0 ? resolve() : reject(Error(`${script} exited ${code}`)));
  child.on('error', reject);
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(`${base}/robots.txt`)).ok) { ready = true; break; } } catch {}
    if (server.exitCode !== null) throw Error(`Production server stopped: ${logs}`);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  if (!ready) throw Error(`Production server unavailable: ${logs}`);
  await run('scripts/mobile-visual-smoke.mjs', [base]);
  await run('scripts/learning-imagery-audit.mjs', [base]);
} finally {
  server.kill('SIGTERM');
  writeFileSync('artifacts/mobile-visual-smoke/server.log', logs);
}
