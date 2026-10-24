#!/usr/bin/env python3
"""Read-only Semrush follow-up: schema, HTML weight, robots and external links.

No forms are submitted. External destinations are checked once per exact URL;
403/429 are access restrictions, not assertions that a destination is broken.
Use --crawl-pages with crawl_seo.py's pages.json for site-wide link discovery.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import urllib.error
import urllib.parse as up
import urllib.request as ur
import xml.etree.ElementTree as ET

AGENT = "SEOAudit/1.0"
CAP = 3_000_000
BOTS = ["Googlebot", "ChatGPT-User", "OAI-SearchBot", "Google-Extended", "PerplexityBot", "Perplexity-User", "Claude-User", "Claude-SearchBot"]


class RobotsPolicy:
    """Most specific group/rule wins; allow wins equal-length ties (RFC 9309).

    Python's RobotFileParser takes the first matching path rule, so Allow: /
    before Disallow: /admin incorrectly reports staff paths as allowed.
    """
    def __init__(self, text):
        self.groups = []
        agents, rules = [], []
        for line in text.splitlines():
            key, separator, value = line.split("#", 1)[0].partition(":")
            if not separator: continue
            key, value = key.strip().lower(), value.strip()
            if key == "user-agent":
                if rules:
                    self.groups.append((agents, rules))
                    agents, rules = [], []
                agents.append(value.lower())
            elif agents and key in ("allow", "disallow") and value:
                rules.append((value, key == "allow"))
        if agents: self.groups.append((agents, rules))

    def can_fetch(self, agent, url):
        matches = []
        for agents, rules in self.groups:
            scores = [0 if value == "*" else len(value) for value in agents if value == "*" or value in agent.lower()]
            if scores: matches.append((max(scores), rules))
        if not matches: return True
        specificity = max(score for score, _ in matches)
        path = up.urlsplit(url).path or "/"
        if up.urlsplit(url).query: path += "?" + up.urlsplit(url).query
        decisions = []
        for score, rules in matches:
            if score != specificity: continue
            for pattern, allow in rules:
                anchor = pattern.endswith("$")
                value = pattern[:-1] if anchor else pattern
                expression = "^" + ".*".join(re.escape(part) for part in value.split("*")) + ("$" if anchor else "")
                if re.search(expression, path): decisions.append((len(value.replace("*", "").encode()), allow))
        return max(decisions)[1] if decisions else True


def fetch(url):
    try:
        response = ur.urlopen(ur.Request(url, headers={"User-Agent": AGENT}), timeout=20)
    except urllib.error.HTTPError as error:
        response = error
    except Exception as error:
        return {"url": url, "error": str(error), "status": None, "body": ""}
    with response:
        raw = response.read(CAP + 1)
        return {"url": url, "final_url": response.geturl(), "status": response.code,
                "headers": dict(response.headers), "bytes": len(raw), "truncated": len(raw) > CAP,
                "body": raw[:CAP].decode("utf-8", errors="replace")}


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.hidden = 0
        self.main = 0
        self.text, self.main_text, self.links, self.schemas = [], [], [], []
        self.schema = None

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "main": self.main += 1
        if tag == "a" and attrs.get("href"): self.links.append(attrs["href"])
        if tag in ("script", "style"):
            self.hidden += 1
            if tag == "script" and attrs.get("type") == "application/ld+json": self.schema = []

    def handle_endtag(self, tag):
        if tag == "main": self.main = max(0, self.main - 1)
        if tag in ("script", "style"):
            self.hidden = max(0, self.hidden - 1)
            if tag == "script" and self.schema is not None:
                self.schemas.append("".join(self.schema))
                self.schema = None

    def handle_data(self, data):
        if self.schema is not None: self.schema.append(data)
        if not self.hidden:
            self.text.append(data)
            if self.main: self.main_text.append(data)


def nodes(value):
    if isinstance(value, dict):
        yield value
        for item in value.values(): yield from nodes(item)
    elif isinstance(value, list):
        for item in value: yield from nodes(item)


def inspect(result):
    parser = Page()
    parser.feed(result.pop("body"))
    text = " ".join(" ".join(parser.text).split())
    main = " ".join(" ".join(parser.main_text).split())
    items, errors = [], []
    for raw in parser.schemas:
        try: items.extend(nodes(json.loads(raw)))
        except ValueError as error: errors.append(str(error))
    for item in items:
        if item.get("@type") == "Course":
            for field in ["name", "description"]:
                if not str(item.get(field, "")).strip(): errors.append(f"Course missing {field}")
            if not item.get("provider", {}).get("name"): errors.append("Course missing provider name")
        if item.get("@type") == "CourseInstance" and not item.get("startDate") and not item.get("courseSchedule"):
            errors.append("CourseInstance has no actual event date or schedule; review Event markup")
    return {**result, "text_bytes": len(text.encode()), "main_words": len(main.split()),
            "text_html_ratio_percent": round(100 * len(text.encode()) / max(1, result["bytes"]), 2),
            "schema_types": sorted(set(str(item["@type"]) for item in items if "@type" in item)),
            "schema_review": errors, "links": parser.links}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("base")
    ap.add_argument("--output", required=True)
    ap.add_argument("--crawl-pages")
    ap.add_argument("--external", action="store_true")
    args = ap.parse_args()
    base = args.base.rstrip("/")
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    robot = fetch(base + "/robots.txt")
    if robot["status"] != 200: raise RuntimeError("Cannot inspect robots policy; stop")
    policy = RobotsPolicy(robot["body"])
    sitemap = fetch(base + "/sitemap.xml")
    if sitemap["status"] != 200: raise RuntimeError("Cannot inspect sitemap; stop")
    root = ET.fromstring(sitemap["body"])
    urls = [node.text for node in root.findall("{*}url/{*}loc")]
    if len(urls) > 250: raise RuntimeError("Sitemap exceeds the deliberate 250 URL cap")
    paths = ["/", "/courses", "/pricing", "/contact", "/blog/choose-online-quran-teacher-usa", "/locations/united-kingdom/london", "/locations/united-states", "/free-trial"]
    paths += [up.urlsplit(url).path for url in urls if up.urlsplit(url).path.startswith("/courses/")]
    paths = list(dict.fromkeys(paths))
    pages = []
    for path in paths:
        if not policy.can_fetch(AGENT, base + path): continue
        response = fetch(base + path)
        if response["status"] in (401, 403, 429): raise RuntimeError(f"Access/rate wall on {path}; stop")
        pages.append(inspect(response))
        print(path, response["status"], flush=True)
    source_pages = json.loads(Path(args.crawl_pages).read_text()) if args.crawl_pages else pages
    canonical_origin = up.urlsplit(urls[0]).netloc if urls else up.urlsplit(base).netloc
    destinations = {}
    for page in source_pages:
        for href in page.get("links", []):
            url = up.urljoin(page["url"], href)
            parts = up.urlsplit(url)
            if parts.scheme not in ("http", "https") or parts.netloc in (up.urlsplit(base).netloc, canonical_origin): continue
            clean = up.urlunsplit(parts._replace(fragment=""))
            destinations.setdefault(clean, set()).add(page["url"])
    external = []
    if args.external:
        def check(url):
            item = fetch(url)
            item.pop("body")
            item["source_pages"] = sorted(destinations[url])
            item["classification"] = "confirmed_http_error" if item["status"] in (404, 410) else "access_restricted" if item["status"] in (401, 403, 429) else "server_error" if (item["status"] or 0) >= 500 else "unverified" if item["status"] is None else "responding"
            return item
        # One request per URL, two workers, no retries or access-wall bypasses.
        with ThreadPoolExecutor(max_workers=2) as pool:
            for item in pool.map(check, sorted(destinations)):
                external.append(item)
                print("external", item["status"], item["url"], flush=True)
    robots = [{"agent": agent, "sitemap_pages_blocked": [url for url in urls if not policy.can_fetch(agent, url)],
               "admin_blocked": not policy.can_fetch(agent, base + "/admin/login")} for agent in BOTS]
    summary = {"base": base, "sitemap_urls": len(urls), "sampled_templates_and_courses": len(pages),
               "external_discovery_pages": len(source_pages), "unique_external_destinations": len(destinations),
               "external_checked": len(external), "schema_review_count": sum(len(page["schema_review"]) for page in pages),
               "limitations": ["Template/course sample for HTML weight; site-wide links only when --crawl-pages supplied", "Local schema checks are not Google's Rich Results Test or Semrush re-audit", "No field Core Web Vitals, account index coverage, direct-origin certificate/SNI or authenticated workflows verified", "HTTPS follows the environment's trusted proxy; no TLS validation was disabled"]}
    for name, data in [("summary", summary), ("pages", pages), ("external-links", external), ("robots", robots)]:
        (output / f"{name}.json").write_text(json.dumps(data, indent=2, ensure_ascii=False))
    print(json.dumps(summary, indent=2))


if __name__ == "__main__": main()
