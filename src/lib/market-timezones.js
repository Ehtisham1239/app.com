import { AUSTRALIA_REGIONS } from "./australia-regions.js";

// Additional planning examples, not additional indexed city landing pages.
export const MARKET_TIME_ZONES = {
  "United States": [{ name: "Denver", slug: "denver", timezone: "America/Denver" }, { name: "Phoenix", slug: "phoenix", timezone: "America/Phoenix" }, { name: "Anchorage", slug: "anchorage", timezone: "America/Anchorage" }, { name: "Honolulu", slug: "honolulu", timezone: "Pacific/Honolulu" }],
  Australia: AUSTRALIA_REGIONS.filter(({ citySlug }) => !citySlug).map(({ city, slug, timezone }) => ({ name: city, slug, timezone })),
  Canada: [
    { name: "Winnipeg", slug: "winnipeg", timezone: "America/Winnipeg" },
    { name: "Halifax", slug: "halifax", timezone: "America/Halifax" },
    { name: "St. John’s", slug: "st-johns", timezone: "America/St_Johns" },
    { name: "Regina", slug: "regina", timezone: "America/Regina" },
  ],
};
