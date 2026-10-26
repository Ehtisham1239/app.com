"use client";

import { useState } from "react";

export function ArticleTools({ url }) {
  const [status, setStatus] = useState("");
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Article link copied.");
    } catch {
      setStatus("Use the address bar to copy this article’s link.");
    }
  }
  return <div data-article-tools className="mt-6 border-t border-line pt-5">
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-outline btn-sm" onClick={copyLink}>Copy article link</button>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => window.print()}>Print or save PDF</button>
    </div>
    <p role="status" className="mt-2 text-sm text-ink-soft">{status}</p>
  </div>;
}
