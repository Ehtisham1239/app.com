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
