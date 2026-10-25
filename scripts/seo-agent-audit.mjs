// Reusable read-only audit runner. No credentials, mutations, deployment or background scheduling.
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const base = new URL(process.argv[2] || 'https://project-umber-three-93.vercel.app');
if (base.username || base.password || base.pathname !== '/' || base.search || base.hash) throw Error('Supply an origin without credentials, path, query or fragment.');
if (base.origin !== 'https://project-umber-three-93.vercel.app' && !(base.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(base.hostname))) throw Error('Target is outside the authorised project or local QA server.');
const output = resolve(root, process.argv[3] || 'artifacts/seo-agent/latest');
mkdirSync(output, { recursive: true });
const run = (script, folder) => new Promise((done, fail) => {
  const child = spawn(process.execPath, [resolve(root, 'scripts', script), base.origin, resolve(output, folder)], { cwd: root, env: process.env, stdio: 'inherit' });
  child.on('error', fail); child.on('exit', code => code === 0 ? done() : fail(Error(`${script} exited ${code}`)));
});
// Sequential so a crawl access/rate wall prevents further automated requests.
await run('technical-seo-audit.mjs', 'technical');
const read = name => JSON.parse(readFileSync(resolve(output, name), 'utf8'));
const technical = read('technical/summary.json');
const findings = read('technical/findings.json');
const wall = technical.errors.some(item => /Access\/rate wall/.test(item.error));
if (wall || technical.errors.length || technical.audited !== technical.uniqueSitemapUrls) throw Error('Incomplete audit; inspect technical output. Further requests stopped.');
await run('public-page-quality.mjs', 'quality');
const quality = read('quality/summary.json');
await run('keyword-coverage.mjs', 'keywords');
const keywords = read('keywords/summary.json');
const observations = [];
for (const path of ['/pricing', '/contact', '/free-trial', '/about']) {
  const response = await fetch(base.origin + path, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
  if ([401, 403, 429].includes(response.status)) throw Error('Access/rate wall on offer review; stopped.');
  if (response.status !== 200) throw Error(`Offer review ${path}: ${response.status}`);
  const html = await response.text();
  const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  observations.push({ path, status: response.status, evidence: 'Reported public wording; business approval is not independently established', trialDayMentions: [...new Set([...text.matchAll(/\b(\d+)[-\s]days?\s+(?:free\s+)?trial\b/gi)].map(match => Number(match[1])))], studentCountClaimSeen: /5,?000\+?\s+(?:active\s+)?students/i.test(text), countryReachClaimSeen: /25\+?\s+countries/i.test(text) });
}
const pages = read('technical/pages.json');
writeFileSync(resolve(output, 'url-inventory.json'), JSON.stringify(pages.map(({ path, status, title, canonical, noindex }) => ({ path, status, title, canonical, noindex })), null, 2) + '\n');
writeFileSync(resolve(output, 'offer-observations.json'), JSON.stringify(observations, null, 2) + '\n');
const summary = { checkedAt: new Date().toISOString(), timezone: 'Asia/Karachi', mode: 'READ_ONLY', base: base.origin, canonicalOrigin: technical.canonicalOrigin, sitemapUrls: technical.uniqueSitemapUrls, audited: technical.audited, technicalFindings: findings.length, qualityFailures: quality.failures.length, keywordPages: keywords.mapped, keywordFailures: keywords.failures.length, topImages: quality.topImagesChecked, requestMethods: ['GET'], integrationMetrics: { gsc: 'Not Checked: authenticated property/export required', ga4: 'Not Checked: authenticated property/export required', semrush: 'Not Checked: entitlement and fresh audit export required' }, limitations: ['Raw HTML and response checks; not Google index status or Rich Results Test', 'No physical-device test, field CWV, actual keyword positions or organic attribution', 'Offer wording is observed, not documentary substantiation', 'No form submissions, authenticated staff operations or external messages'] };
writeFileSync(resolve(output, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
writeFileSync(resolve(output, 'REPORT.md'), `# OQC SEO agent run\n\nChecked: ${summary.checkedAt}; reporting timezone: Asia/Karachi.\n\nMode: READ_ONLY. Target: ${base.origin}.\n\nVerified: ${summary.audited}/${summary.sitemapUrls} declared URLs, ${findings.length} technical findings, ${quality.failures.length} quality failures and ${quality.topImagesChecked} top-image responses. Visible topic coverage: ${keywords.mapped} pages, ${keywords.curatedTopics} curated service topics, ${keywords.failures.length} placement failures. URL inventory and observed offer wording are separate JSON files.\n\nNot checked: authenticated GSC/GA4/Semrush performance, keyword positions, field CWV, actual enquiry persistence and staff workflows.\n\nNo production settings, content, database, DNS or deployment were changed by this command.\n`);
console.log(JSON.stringify(summary, null, 2));
if (findings.length || quality.failures.length) process.exitCode = 1;
