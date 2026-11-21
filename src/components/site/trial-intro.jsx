"use client";
import { useSearchParams } from "next/navigation";
import { CalendarCheck2, Clock3, HeartHandshake, ShieldCheck } from "@/components/site/icons";
import { isTrialEligible } from "@/lib/trial-eligibility";

const PROMISES = [
  { icon: Clock3, title: "Admissions follow-up", text: "A coordinator contacts you by WhatsApp or email to discuss a suitable time." },
  { icon: HeartHandshake, title: "Share your teacher preference", text: "Share any teacher preference. Admissions confirms teacher availability and the teaching language." },
  { icon: CalendarCheck2, title: "3 days free on eligible plans", text: "No card needed for the free Quran trial classes. The Weekend plan is excluded." },
  { icon: ShieldCheck, title: "Your details are safe", text: "Read our privacy policy to understand how enquiry details are collected and used." },
];

// The selected package (?plan=) is read in the browser so /free-trial stays a cached,
// static page. Without a plan, or before the URL is read, the free-trial version shows.
function useSelectedPlan(plans) {
  const params = useSearchParams();
  const plan = plans.find((p) => p.id === params?.get("plan"));
  return { plan, eligible: isTrialEligible(plan) };
}

function PromiseList({ promises, className }) {
  return (
    <ul className={className}>
      {promises.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex gap-3">
          <Icon className="mt-0.5 size-5 shrink-0 text-gold-300" aria-hidden="true" />
          <div><h2 className="text-[0.98rem] font-semibold text-white">{title}</h2><p className="mt-0.5 text-[0.86rem] text-white/75">{text}</p></div>
        </li>
      ))}
    </ul>
  );
}

export function TrialHeading({ plans = [] }) {
  const { plan, eligible } = useSelectedPlan(plans);
  return <TrialHeadingView eligible={eligible} planName={plan?.name} />;
}

export function TrialHeadingView({ eligible = true, planName }) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold-300">{eligible ? "Free trial" : "Package enquiry"}</p>
      <h1 id="trial-title" className="mt-2 text-[clamp(1.9rem,4.6vw,3rem)] leading-[1.1] text-white">{eligible ? <>Book a free <span className="text-gold-300">3-day</span> trial</> : `Enquire about ${planName}`}</h1>
      <p className="mt-3 max-w-xl text-[1.02rem] leading-relaxed text-white/85">{eligible ? "Request a free online Quran trial with 3 days of live one-to-one classes. A coordinator will arrange a time that suits your family." : "This package is not eligible for a free trial. Ask the coordinator about its schedule and terms before enrolling."}</p>
    </>
  );
}

export function TrialPromises({ plans = [], className }) {
  const { eligible } = useSelectedPlan(plans);
  return <TrialPromisesView eligible={eligible} className={className} />;
}

export function TrialPromisesView({ eligible = true, className }) {
  return <PromiseList className={className} promises={eligible ? PROMISES : PROMISES.filter((p) => p.title !== "3 days free on eligible plans")} />;
}
