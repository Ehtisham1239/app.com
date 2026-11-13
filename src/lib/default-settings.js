// Shared editable defaults without database loaders or the content snapshot.
import { REVIEWS_BUTTON_DEFAULTS } from "./reviews-button.js";
export const DEFAULT_SETTINGS = {
  "site.identity": {
    name: "Online Quran College",
    legal_name: "Online Quran College LTD",
    tagline: "Unlock the wisdom of the Quran with our online Quran college. Explore, learn, and grow with us.",
    established: "",
    description:
      "Live one-to-one online Quran, Tajweed, Hifz, Arabic and Islamic studies classes for children and adults, with teacher preferences and flexible timings. Teacher availability is confirmed before enrolment.",
  },
  "site.contact": {
    email: "info@onlinequrancollege.com",
    phone: "+44 7864 710821",
    whatsapp: "447864710821",
    location: "United Kingdom",
    hours: "24/7 enquiry support; live class times arranged by availability across time zones",
  },
  "site.social": {
    facebook: "https://www.facebook.com/OnlineQuranCollegeLtdUK",
    x: "https://x.com/OnlineQuranClg",
    instagram: "https://www.instagram.com/online_quran_college",
    youtube: "",
    tiktok: "",
    trustpilot: "",
  },
  "site.hero": {
    eyebrow: "Live 1-on-1 online Quran classes",
    title: "Live one-to-one online Quran classes for children and adults",
    subtitle:
      "Personal Quran lessons for children and adults, including Noorani Qaida, Tajweed, Hifz and Arabic. Discuss teacher availability and class times with our admissions team.",
    primary_label: "Request a 3-day free trial",
    secondary_label: "Explore courses",
    badges: ["3-day free trial on eligible plans", "No card needed on eligible plans", "Teacher preference discussed", "Classes in any time zone"],
  },
  "site.stats": [
    { value: "Online", label: "Learn from home" },
    { value: "All ages", label: "Children & adults" },
    { value: "1-on-1", label: "Live classes" },
    { value: "AM & PM", label: "Class slots" },
  ],
  "site.benefits": [
    { icon: "badge-percent", title: "Clear monthly packages", text: "Compare published monthly packages by lesson frequency and duration before enrolling." },
    { icon: "heart-handshake", title: "Female tutors available", text: "Female teachers for children and sisters, for comfort and privacy." },
    { icon: "languages", title: "Teaching languages", text: "English and Arabic are listed on public teacher profiles; Urdu is available with selected teachers. Confirm language fit before booking." },
    { icon: "calendar-clock", title: "Your schedule, your pace", text: "Choose class length, days and focus — pacing adjusted to each student." },
    { icon: "award", title: "Certificates", text: "Formal certificates after final assessments." },
    { icon: "headset", title: "Coordinator support", text: "Coordinators help with rescheduling and make-up classes." },
  ],
  "site.steps": [
    { title: "Request a free trial", text: "Fill in the short form, choose a course and tell us when you are free. A coordinator contacts you to arrange your trial." },
    { title: "Choose your plan", text: "After the trial, a coordinator agrees timings, teacher preference and a monthly package with you." },
    { title: "Start regular classes", text: "Meet your teacher live online on your chosen days and track progress every month." },
  ],
  "site.announcement": { enabled: true, text: "3-day free trial on eligible plans. Weekend plan excluded. No card needed on eligible plans.", link_label: "Request a trial", link: "/free-trial" },
  "site.family_discount": {
    enabled: true,
    name: "Sibling Discount",
    percent: 15,
    applies_to: "each_additional_child",
    max_learners: 5,
    billing_period: "monthly",
    eligible_plan_ids: [
      "9f191bbd-42de-4fa6-8b34-613e60925d44",
      "cec03624-ecdf-4287-bc99-6c4fea2f813e",
      "7af44c20-9142-4502-a0a3-640a1fea0be7",
      "70b36488-a881-4499-8d49-026ddb17231f",
      "b7f3114c-e499-4621-a6e3-cd45062bb2b6",
      "a89c9944-595f-4599-8d49-026ddb17231f",
    ],
  },
  "site.reviews_button": { ...REVIEWS_BUTTON_DEFAULTS },
  "site.forms": {
    consent_version: "2026-10-13",
    consent_text:
      "I agree that Online Quran College may contact me by email, phone or WhatsApp about this request and store my details as described in the privacy policy.",
    trial_success: "JazakAllah khair! Your free-trial request is in. Our admissions team will contact you by WhatsApp or email to arrange your class.",
    contact_success: "Thank you — your message has reached our team. Our coordinator will review it and contact you using the details you provided.",
  },
  "site.chat": { enabled: true, widget_key: "BZrCMwoaC3UYn9OpkcSASivkWFYm5A0B" },
  "site.analytics": { enabled: true, ga4_measurement_id: "G-57TGPTDNT4", gtm_container_id: "GTM-W7CMZS53" },
  "site.seo": {
    title: "Online Quran College — Live 1-on-1 Online Quran Classes",
    description:
      "Learn Quran online with live one-to-one classes for children and adults. Explore Noorani Qaida, Tajweed, Hifz and Arabic, and request a 3-day trial on eligible plans.",
  },
};
