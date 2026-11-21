// Free, read-only daily SEO audit. Node.js 20+, no dependencies or paid APIs.
import { writeFileSync, mkdirSync } from 'node:fs';
const origin = 'https://www.onlinequrancollege.com';
const limit = 500;
const queue = [origin + '/', origin + '/sitemap.xml'];
const seen = new Set(), rows = [], issues = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
function add(url) {
  try {
    const u = new URL(url, origin);
    u.hash = '';
    if (u.origin !== origin || !/^https?:$/.test(u.protocol)) return;
    if (/\.(?:png|jpe?g|gif|webp|svg|ico|pdf|zip|mp4|woff2?|css|js)(?:$|\?)/i.test(u.pathname)) return;
    if (!seen.has(u.href) && !queue.includes(u.href) && seen.size + queue.length < limit * 4) queue.push(u.href);
  } catch {}
}
function matches(html, re) { return [...html.matchAll(re)].map(m => m[1]); }
while (queue.length && seen.size < limit) {
  const url = queue.shift();
  if (seen.has(url)) continue;
  seen.add(url);
  try {
    const response = await fetch(url, { headers: { 'user-agent': 'OQC-Free-SEO-Audit/1.0 (+read-only)' }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
    const type = response.headers.get('content-type') || '';
    const body = /xml|html/.test(type) ? await response.text() : '';
    const xml = /xml/.test(type) || /\.xml(?:$|\?)/.test(url);
    if (xml) {
      for (const loc of matches(body, /<loc>\s*([^<]+)\s*<\/loc>/gi)) add(loc.replace(/&amp;/g, '&'));
    } else if (/html/.test(type)) {
      const title = matches(body, /<title[^>]*>([\s\S]*?)<\/title>/gi)[0]?.trim() || '';
      const description = matches(body, /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)/gi)[0] || matches(body, /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description/gi)[0] || '';
      const h1 = matches(body, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi).length;
      const canonical = matches(body, /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/gi)[0] || matches(body, /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical/gi)[0] || '';
      const noindex = /<meta\s+[^>]*content=["'][^"']*noindex/i.test(body) || /noindex/i.test(response.headers.get('x-robots-tag') || '');
      for (const href of matches(body, /<a\b[^>]*href=["']([^"'#]+)["']/gi)) add(href);
      if (response.ok && !noindex) {
        if (!title) issues.push({url, issue:'missing_title'});
        if (!description) issues.push({url, issue:'missing_description'});
        if (!h1) issues.push({url, issue:'missing_h1'});
        if (!canonical) issues.push({url, issue:'missing_canonical'});
        if (h1 > 1) issues.push({url, issue:'multiple_h1'});
      }
      rows.push({url, status:response.status, title, description, h1, canonical, noindex});
    } else rows.push({url, status:response.status});
    if (response.status >= 400) issues.push({url, issue:'http_' + response.status});
  } catch (error) {
    rows.push({url, status:'ERROR', error:String(error)});
    issues.push({url, issue:'fetch_error', detail:String(error)});
  }
  await sleep(150);
}
mkdirSync('seo-reports', {recursive:true});
const report = {date:new Date().toISOString(), origin, crawled:seen.size, limit, truncated:queue.length>0, issues, pages:rows};
writeFileSync('seo-reports/audit.json', JSON.stringify(report,null,2));
const summary = ['# Daily SEO Audit', '', 'Site: '+origin, 'Crawled URLs: '+seen.size+' / '+limit, 'Remaining queue: '+queue.length, 'Issues: '+issues.length, '', '| Issue | URL |', '|---|---|', ...issues.map(i=>'| '+i.issue+' | '+i.url.replaceAll('|','%7C')+' |')].join('\n');
writeFileSync('seo-reports/summary.md',summary);
console.log(summary);
if (!rows.length) process.exitCode = 1;
