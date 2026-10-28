#!/usr/bin/env python3
"""Read-only checks of published CMS articles and their contextual links."""
import argparse
import concurrent.futures
import datetime as dt
import hashlib
import html as html_lib
import json
from html.parser import HTMLParser
from pathlib import Path
import re
import urllib.parse as up
import urllib.request as ur


class Node:
    def __init__(self, tag='', attrs=None):
        self.tag, self.attrs, self.children = tag, dict(attrs or []), []

    def text(self):
        return ''.join(c.text() if isinstance(c, Node) else c for c in self.children)

    def all(self, predicate):
        found = [self] if predicate(self) else []
        for child in self.children:
            if isinstance(child, Node):
                found.extend(child.all(predicate))
        return found


class Document(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for index in range(len(self.stack)-1, 0, -1):
            if self.stack[index].tag == tag:
                self.stack = self.stack[:index]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def normal(text):
    return re.sub(r'\s+', ' ', text).strip()


def fetch(url):
    try:
        request = ur.Request(url, headers={'User-Agent': 'OQC-Editorial-QA/1.0', 'Accept-Encoding': 'identity'})
        with ur.urlopen(request, timeout=18) as response:
            return {'url': url, 'final_url': response.url, 'status': response.status,
                    'html': response.read(4_000_001).decode('utf-8', errors='replace')}
    except Exception as exc:
        return {'url': url, 'status': getattr(exc, 'code', None), 'error': str(exc)}


def inspect(post, origin, out):
    url = origin + '/blog/' + post['slug']
    response = fetch(url)
    if response.get('status') != 200:
        return {'slug': post['slug'], **response, 'issues': ['HTTP_OR_FETCH_ERROR']}
    html = response.pop('html')
    (out / (post['slug'] + '.html')).write_text(html)
    root = Document(html).root
    select = root.all
    body = select(lambda n: 'prose-oqc' in n.attrs.get('class', '').split())
    body_text = normal(body[0].text()) if body else ''
    expected = normal(Document(post['body_html']).root.text())
    canonical = [n.attrs.get('href') for n in select(lambda n: n.tag == 'link' and n.attrs.get('rel') == 'canonical')]
    metas = {n.attrs.get('name', n.attrs.get('property')): n.attrs.get('content', '') for n in select(lambda n: n.tag == 'meta')}
    schemas, schema_errors = [], []
    for script in select(lambda n: n.tag == 'script' and n.attrs.get('type') == 'application/ld+json'):
        try:
            schemas.append(json.loads(script.text()))
        except ValueError as exc:
            schema_errors.append(str(exc))
    article = next((s for s in schemas if isinstance(s, dict) and s.get('@type') == 'BlogPosting'), {})
    hero = select(lambda n: 'data-hero-visual' in n.attrs)
    covers = hero[0].all(lambda n: n.tag == 'img') if hero else []
    headings = [normal(n.text()) for n in select(lambda n: n.tag == 'h1')]
    body_links = [n.attrs['href'] for n in body[0].all(lambda n: n.tag == 'a' and n.attrs.get('href'))] if body else []
    toc = select(lambda n: n.tag == 'nav' and n.attrs.get('aria-label') == 'In this article')
    targets = {n.attrs['id'] for n in select(lambda n: 'id' in n.attrs)}
    toc_valid = bool(toc) and all(up.unquote(n.attrs.get('href', '')).lstrip('#') in targets for n in toc[0].all(lambda n: n.tag == 'a'))
    words = len(body_text.split())
    result = {'slug': post['slug'], **response, 'title': [normal(n.text()) for n in select(lambda n: n.tag == 'title')],
              'description': metas.get('description'), 'canonical': canonical, 'robots': metas.get('robots'),
              'h1': headings, 'body_words': words, 'body_matches_cms': body_text == expected,
              'body_sha256': hashlib.sha256(body_text.encode()).hexdigest(), 'contextual_links': body_links,
              'toc_valid': toc_valid, 'cover': covers[0].attrs if covers else {}, 'article_schema': article,
              'schema_errors': schema_errors, 'issues': []}
    rules = {
        'WORD_LIMIT': 0 < words <= 1000,
        'CMS_BODY_MISMATCH': body_text == expected,
        'CANONICAL': canonical == [url],
        'ONE_H1': len(headings) == 1 and headings[0] == post['title'],
        'TITLE': bool(result['title']) and (not post.get('seo_title') or result['title'] == [post['seo_title']]),
        'DESCRIPTION': bool(result['description']) and result['description'] == post.get('seo_description'),
        'ROBOTS': 'noindex' not in metas.get('robots', '').lower(),
        # The app's stripHtml counts block/tag boundaries separately, while DOM
        # textContent can join adjacent headings/paragraphs. Validate its actual
        # algorithm, and report the visible-text count independently.
        'ARTICLE_SCHEMA': article.get('headline') == post['title'] and article.get('wordCount') == len(normal(html_lib.unescape(re.sub(r'<[^>]*>', ' ', post['body_html']))).split()),
        'COVER_ALT': bool(result['cover'].get('alt')),
        'COVER_DIMENSIONS': bool(result['cover'].get('width')) and bool(result['cover'].get('height')),
        'TOC_ANCHORS': toc_valid,
        'JSONLD_PARSE': not schema_errors,
        'TRIAL_PATH': '/free-trial' in html,
    }
    result['issues'] = [key for key, ok in rules.items() if not ok]
    return result


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('snapshot', type=Path)
    ap.add_argument('--origin', default='https://www.onlinequrancollege.com')
    ap.add_argument('--output', type=Path, required=True)
    args = ap.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    origin = args.origin.rstrip('/')
    posts = [p for p in json.loads(args.snapshot.read_text()) if p.get('status', 'published') == 'published']
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        results = list(pool.map(lambda p: inspect(p, origin, args.output), posts))
    destinations = sorted({up.urljoin(origin, link) for r in results for link in r.get('contextual_links', []) if up.urlsplit(up.urljoin(origin, link)).netloc == up.urlsplit(origin).netloc})
    paths = sorted({up.urldefrag(link).url for link in destinations})
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        responses = list(pool.map(fetch, paths))
    documents = {r['url']: r for r in responses}
    links = []
    for destination in destinations:
        url, fragment = up.urldefrag(destination)
        response = documents[url]
        valid = response.get('status') == 200
        if valid and fragment:
            valid = bool(Document(response.get('html', '')).root.all(lambda n: n.attrs.get('id') == up.unquote(fragment)))
        links.append({'url': destination, 'status': response.get('status'), 'fragment_valid': valid if fragment else None, 'ok': valid})
    report = {'origin': origin, 'utc_timestamp': dt.datetime.now(dt.timezone.utc).isoformat(),
              'article_count': len(results), 'articles': results, 'contextual_link_checks': links,
              'limits': ['Raw HTML and source agreement only; browser layout and accessibility are separate.',
                         'Not proof of Google indexing, rankings, rich-result eligibility or field Core Web Vitals.',
                         'Contextual same-origin links checked; external citations and vendor endpoints are separate.']}
    (args.output / 'report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print(json.dumps({'articles': len(results), 'article_issues': {r['slug']: r['issues'] for r in results if r['issues']},
                      'contextual_links': len(links), 'link_errors': [r for r in links if not r['ok']]}, indent=2))


if __name__ == '__main__':
    main()
