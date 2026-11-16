"use client";

import { useState } from "react";

export function ArticleTools({ url, title }) {
  const [status, setStatus] = useState("");
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Article link copied.");
    } catch {
      setStatus("Use the address bar to copy this article’s link.");
    }
  }
  const articleUrl = encodeURIComponent(url);
  const articleText = encodeURIComponent(`${title} ${url}`);
  const shares = [
    ["WhatsApp", `https://wa.me/?text=${articleText}`],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${articleUrl}`],
    ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${articleUrl}`],
  ];
  return <div data-article-tools className="mt-6 border-t border-line pt-5">
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-outline btn-sm" onClick={copyLink}>Copy article link</button>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => window.print()}>Print or save PDF</button>
    </div>
    <nav aria-label="Share this article" className="mt-3 flex flex-wrap gap-2">
      {shares.map(([name, href]) => (
        <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
          Share on {name}
        </a>
      ))}
    </nav>
    <p role="status" className="mt-2 text-sm text-ink-soft">{status}</p>
  </div>;
}
