import Link from "next/link";
import { clsx } from "clsx";
import { Check } from "@/components/site/icons";
import { formatMoney } from "@/lib/format";

const PERIOD = { monthly: "/ month", quarterly: "/ quarter", yearly: "/ year", one_time: "one-time" };

function mainPrice(prices, currency) {
  const list = Array.isArray(prices) ? prices : [];
  if (currency) return list.find((p) => p.currency === currency) ?? null;
  return list.find((p) => p.currency === "USD") ?? list[0] ?? null;
}

export function PricingCards({ plans, compact = false, currency }) {
  const list = Array.isArray(plans) ? plans : [];
  if (!list.length) return null;
  const cols = list.length >= 4 ? "lg:grid-cols-4" : list.length === 3 ? "lg:grid-cols-3" : "lg:mx-auto lg:max-w-4xl lg:grid-cols-2";
  return (
    <div className={clsx("grid gap-5 pt-3 sm:grid-cols-2", cols)}>
      {list.map((p) => {
        const price = mainPrice(p.prices, currency);
        const others = currency ? [] : (p.prices ?? []).filter((x) => x !== price);
        const features = (Array.isArray(p.features) ? p.features : []).slice(0, compact ? 4 : 12);
        const featured = Boolean(p.is_featured);
        return (
          <div
            key={p.id}
            className={clsx(
              "pricing-card editorial-card relative flex flex-col p-6",
              featured ? "ring-2 ring-leaf-700" : "",
            )}
          >
            <div className="package-caption"><span className="text-xs font-semibold uppercase tracking-wider text-leaf-700">Personal lessons</span>{featured && <span className="rounded-full bg-leaf-700 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">Featured</span>}</div>
            <h3 className="text-[1.15rem] font-bold text-mushaf-900">{p.name}</h3>
            {p.tagline && <p className="mt-1 text-[0.9rem] leading-snug text-ink-soft">{p.tagline}</p>}
            <p className="mt-5 flex flex-wrap items-baseline gap-x-1.5">
              {price ? (
                <>
                  <span className="font-display text-[2.6rem] leading-none text-mushaf-900">{formatMoney(price.amount_minor, price.currency)}</span>
                  <span className="text-[0.9rem] text-ink-faint">{PERIOD[p.billing_period] ?? ""}</span>
                </>
              ) : (
                <span className="font-display text-[1.6rem] text-mushaf-900">{currency ? `Ask for the fee in ${currency}` : "Ask for the fee"}</span>
              )}
            </p>
            {others.length > 0 && <p className="mt-1.5 text-[0.8rem] text-ink-faint">or {others.map((o) => formatMoney(o.amount_minor, o.currency)).join(" · ")}</p>}
            <p className="mt-4 flex flex-wrap gap-2">
              {p.classes_per_week ? (
                <span className="chip">
                  {p.classes_per_week} {p.classes_per_week === 1 ? "day" : "days"} a week
                </span>
              ) : null}
              {p.duration_min ? <span className="chip">{p.duration_min}-minute classes</span> : null}
            </p>
            {features.length > 0 ? (
              <ul className="mt-5 flex-1 space-y-2.5 text-[0.93rem] text-ink">
                {features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-leaf-600" strokeWidth={3} aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1" />
            )}
            <Link href={`/free-trial?plan=${p.id}`} className={clsx("btn mt-6 w-full", featured ? "btn-gold" : "btn-primary")}>
              Start with a free trial
            </Link>
          </div>
        );
      })}
    </div>
  );
}
