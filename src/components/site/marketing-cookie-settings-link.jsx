"use client";

// Lets visitors reopen the existing Meta marketing-cookie choice and withdraw consent later.
// This does not create an analytics preference or alter OQC's cookieless GA4/GTM configuration.
export function MarketingCookieSettingsLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("oqc:open-marketing-preferences"))}
      className="footer-link text-left"
    >
      Cookie settings
    </button>
  );
}
