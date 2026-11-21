import { feeAnswer } from "./fee-answer.js";

// A direct answer shown at the top of articles that rank for a question, built from live
// site data so it never disagrees with the pricing page. Search Console (28 days to 3 Nov
// 2026): "how much do online quran classes cost in the uk?" at position ~9 lands on the
// UK fees article, which explained how to compare but never gave the figure.
const ARTICLE_ANSWERS = {
  "online-quran-class-fees-uk-comparison": ({ plans, fx }) => {
    const fee = feeAnswer(plans, fx, "GBP");
    return fee && { question: "How much do online Quran classes cost in the UK?", answer: fee.answer, link: { label: "Compare fees and packages", href: "/pricing?currency=GBP" } };
  },
};

export const articleNeedsAnswer = (slug) => Boolean(ARTICLE_ANSWERS[slug]);
export function articleAnswer(slug, data) {
  return ARTICLE_ANSWERS[slug]?.(data) || null;
}

const ENTITIES = { "&amp;": "&", "&quot;": "\"", "&#39;": "'", "&#x27;": "'", "&rsquo;": "’", "&lsquo;": "‘", "&ldquo;": "“", "&rdquo;": "”", "&nbsp;": " ", "&lt;": "<", "&gt;": ">", "&ndash;": "–", "&mdash;": "—" };
const plain = (html) => html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, (e) => ENTITIES[e.toLowerCase()] ?? e).replace(/\s+/g, " ").trim();

// AEO (19 Nov 2026): the question headings (h2/h3) an article already shows, each paired with the
// first paragraph printed under it. Only visible text is used, so the FAQPage markup always
// matches the page. Answers are cut at a sentence end near 320 characters.
export function articleQuestionAnswers(html = "", limit = 6) {
  const out = [];
  const parts = String(html).split(/<h[23]\b[^>]*>/i).slice(1);
  for (const part of parts) {
    const end = part.search(/<\/h[23]>/i);
    if (end < 0) continue;
    const question = plain(part.slice(0, end)).replace(/^\d+[.)]\s*/, "");
    if (!/\?$/.test(question) || question.length < 12 || question.length > 160) continue;
    const next = part.slice(end);
    const para = next.slice(0, next.search(/<h[23]\b/i) >= 0 ? next.search(/<h[23]\b/i) : undefined).match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
    let answer = para ? plain(para[1]) : "";
    if (answer.length < 40) continue;
    if (answer.length > 320) {
      const cut = answer.slice(0, 320);
      const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
      answer = stop > 120 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, "") + "…";
    }
    if (!out.some((f) => f.question === question)) out.push({ question, answer });
    if (out.length >= limit) break;
  }
  return out;
}
