// Country-specific guidance for online learners. Fees, offers and teacher availability are coordinator-confirmed.
export const MARKET_GUIDES = {
  "united-kingdom": {
    title: "Planning online Quran lessons around UK family life",
    sections: [
      { title: "Plan around UK local time", text: "The UK uses Greenwich Mean Time in winter and British Summer Time in summer. Choose the actual lesson date and your city when suggesting a recurring slot, because the Pakistan–UK time difference changes when either country changes clocks. The coordinator confirms the final timetable and teacher availability.", path: "/free-trial?country=United+Kingdom&currency=GBP", link: "Discuss a UK lesson time" },
      { title: "Choose a learning pathway", text: "Children can begin with Arabic letters and Noorani Qaida or continue with Quran reading and Tajweed. Adults can explain their current reading level and learning goals. Ask for the written GBP fee, lesson duration, weekly frequency, teacher preference and rescheduling terms before enrolling.", path: "/courses", link: "Compare Quran courses" },
      { title: "Know who you are enrolling with", text: "OQC delivers live online lessons; this page does not represent a UK classroom or local branch. Review the legal entity and contact details shown on the website, read the privacy and cancellation terms, and ask Admissions to confirm the contracting entity and payment recipient before paying.", path: "/refund-policy", link: "Read cancellation and refund terms" },
      { title: "Parent-led enquiries and child privacy", text: "For learners under 18, a parent or guardian should submit the enquiry and manage communications. OQC should collect only information needed to arrange and deliver lessons, explain how it is used, and avoid using children's personal data for behavioural advertising or unrelated marketing.", path: "/privacy-policy", link: "Read the privacy policy" }
    ],
    sources: [
      { name: "GOV.UK: when the clocks change", url: "https://www.gov.uk/when-do-the-clocks-change" },
      { name: "ICO: direct marketing and PECR", url: "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/" },
      { name: "ICO: marketing to children", url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/children-and-the-uk-gdpr/can-we-use-children-s-personal-information-for-direct-marketing-purposes/" },
      { name: "ICO: cookies and similar technologies", url: "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/" },
      { name: "ASA/CAP: testimonials and endorsements", url: "https://www.asa.org.uk/advice-online/testimonials-and-endorsements.html" }
    ]
  },
  "united-states": {
    title: "Planning online Quran lessons across US time zones",
    sections: [
      { title: "Choose your city and actual lesson date", text: "The United States spans multiple time zones. Most locations observe daylight saving time, while Hawaii and most of Arizona do not; local exceptions also exist. Choose the learner's city and date rather than relying on a single US-wide time. The coordinator confirms the recurring timetable in your local time.", path: "/free-trial?country=United+States&currency=USD", link: "Discuss a US lesson time" },
      { title: "Select the right course and teacher", text: "Share the learner's current reading level and whether the goal is Noorani Qaida, Quran reading with Tajweed, Hifz with revision, Arabic or translation. You may request a male or female teacher and preferred lesson window; the team confirms availability before enrolment. Confirm the written USD fee and rescheduling terms.", path: "/courses", link: "Compare Quran courses" },
      { title: "Parent or guardian manages a child's enrolment", text: "For learners under 13, assess whether the service's collection of information from children triggers COPPA obligations. Use a parent-facing enquiry, minimise information collected, provide a clear privacy notice, and obtain any legally required verifiable parental consent before collecting personal information directly from a child.", path: "/privacy-policy", link: "Read the privacy policy" },
      { title: "Understand the online-only service", text: "Lessons are delivered live online to learners joining from home. This page does not claim a US office, local school, state education licence or US business registration. Review the actual legal entity, payment recipient, service terms and refund/cancellation policy before paying.", path: "/refund-policy", link: "Review cancellation and refund terms" }
    ],
    sources: [
      { name: "US Department of Transportation: daylight saving time", url: "https://www.transportation.gov/regulations/daylight-saving-time" },
      { name: "FTC: COPPA frequently asked questions", url: "https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions" },
      { name: "FTC: CAN-SPAM compliance guide", url: "https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business" }
    ]
  },
  canada: {
    title: "Planning online Quran lessons across Canadian time zones",
    sections: [
      { title: "Use the learner's province, city and date", text: "Canada spans several time zones and daylight-saving rules vary by province and territory. Choose the learner's city and actual lesson date; do not assume one Canadian time or copy a Toronto timetable to Vancouver, Calgary, Halifax or Newfoundland. The coordinator confirms the recurring lesson in local time.", path: "/free-trial?country=Canada&currency=CAD", link: "Discuss a Canadian lesson time" },
      { title: "Confirm course fit and CAD fees", text: "Explain whether the learner is beginning with Arabic letters, improving Quran reading and Tajweed, memorising with revision, or studying Arabic and translation. Ask which teacher and teaching language can be accommodated, then obtain the written CAD fee, lesson frequency and rescheduling terms before enrolling.", path: "/courses", link: "Compare Quran courses" },
      { title: "Use clear parent or guardian consent", text: "For child learners, make the parent or guardian the primary contact. Canada's privacy guidance expects meaningful consent, age-appropriate transparency and parental consent where a child cannot meaningfully consent; the Office of the Privacy Commissioner generally views children under 13 as requiring parental consent, subject to the applicable provincial law and circumstances.", path: "/privacy-policy", link: "Read the privacy policy" },
      { title: "Keep marketing consent separate", text: "Canada's anti-spam rules apply to commercial email and text messages sent to Canadian recipients, including from abroad. Record the applicable express or implied consent, identify the sender and include a working unsubscribe mechanism. A trial enquiry is not blanket consent for unrelated ongoing marketing.", path: "/contact", link: "Contact Admissions" }
    ],
    sources: [
      { name: "National Research Council: Canada's official time and time zones", url: "https://www.cnrc.canada.ca/en/certifications-evaluations-standards/canadas-official-time/time-zones-daylight-saving-time" },
      { name: "CRTC: CASL Act, regulations and guidelines", url: "https://crtc.gc.ca/eng/internet/anti/reg.htm" },
      { name: "CRTC: CASL frequently asked questions", url: "https://crtc.gc.ca/eng/com500/faq500.htm" },
      { name: "Office of the Privacy Commissioner: meaningful consent", url: "https://www.priv.gc.ca/en/privacy-topics/privacy-for-businesses/appropriate-handling-of-personal-information/collecting-personal-information-and-consent/consent/gl_omc_201805/" },
      { name: "Office of the Privacy Commissioner: children's privacy code", url: "https://www.priv.gc.ca/en/privacy-topics/privacy-for-businesses/protection-of-children-for-businesses/childrens-privacy-code/children-code-final-report-2026/" }
    ]
  },
  australia: {
    title: "Planning online Quran lessons across Australian time zones",
    sections: [
      { title: "Choose your state, city and lesson date", text: "Australian states and territories do not all follow the same daylight-saving rules. Sydney, Melbourne and Adelaide can change seasonal offsets, while Brisbane, Perth and Darwin do not observe daylight saving. Choose the learner's city and actual date before suggesting a recurring lesson; the coordinator confirms the timetable.", path: "/free-trial?country=Australia&currency=AUD", link: "Discuss an Australian lesson time" },
      { title: "Fit learning around school and family routines", text: "Tell Admissions whether an after-school, evening or weekend slot is preferred and whether a parent will support the learner during the trial. Explain the learner's current reading level and goals, then confirm the AUD fee, weekly frequency, lesson duration and rescheduling terms in writing.", path: "/courses", link: "Compare Quran courses" },
      { title: "Parent-led enrolment and privacy", text: "For children, use a parent or guardian as the enquiry contact and collect only details needed to arrange lessons. Confirm what personal information is stored, who can access it, how long it is retained and how parents can request access or correction. Check whether the Australian Privacy Act applies to the contracting entity and its activities.", path: "/privacy-policy", link: "Read the privacy policy" },
      { title: "Respect Australian consumer and marketing rules", text: "Overseas businesses that directly offer services to Australian consumers may be subject to Australian Consumer Law. Keep service descriptions, fees, trial conditions and refund terms accurate. Commercial email and SMS require an appropriate consent basis, accurate sender identification and a working unsubscribe process.", path: "/refund-policy", link: "Review cancellation and refund terms" }
    ],
    sources: [
      { name: "Fair Work Ombudsman: daylight saving in Australia", url: "https://www.fairwork.gov.au/tools-and-resources/library/K600489_Daylight-saving-in-Australia" },
      { name: "ACMA: avoid sending spam", url: "https://www.acma.gov.au/avoid-sending-spam" },
      { name: "ACMA: email and SMS unsubscribe rules", url: "https://www.acma.gov.au/sites/default/files/2024-05/Fact%20sheet%20-%20email%20and%20SMS%20unsubscribe%20rules.pdf" },
      { name: "ACCC: false or misleading claims", url: "https://www.accc.gov.au/consumers/advertising-and-promotions/false-or-misleading-claims" },
      { name: "ACCC: online reviews", url: "https://www.accc.gov.au/consumers/advertising-and-promotions/online-reviews-for-product-and-services" },
      { name: "ACCC: buying online from overseas businesses", url: "https://www.accc.gov.au/consumers/buying-products-and-services/buying-online" }
    ]
  },
  "united-arab-emirates": {
    title: "Planning online Quran lessons across the UAE",
    sections: [
      { title: "Choose your emirate and Gulf Standard Time", text: "Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah and Umm Al Quwain use Asia/Dubai time (UTC+4). Share a realistic window around school, work and family commitments; the coordinator confirms teacher availability and the final recurring timetable.", path: "/free-trial?country=United+Arab+Emirates&currency=AED", link: "Discuss a UAE lesson time" },
      { title: "Choose a course and confirm AED fees", text: "Tell the team whether the learner is starting with Noorani Qaida, improving Quran reading and Tajweed, memorising with revision, or studying Arabic and translation. Ask for the written AED package, lesson duration, weekly frequency, payment and rescheduling terms before enrolling. A free-trial request does not guarantee a particular teacher or slot.", path: "/courses", link: "Compare Quran courses" },
      { title: "Understand the online-only service", text: "OQC provides live online lessons to learners joining from home. This country guide does not claim a UAE office, classroom, local branch or UAE education-centre licence. Families seeking a locally licensed in-person institute should verify the provider with the relevant emirate authority.", path: "/contact", link: "Ask the admissions team" },
      { title: "Check credentials and listings carefully", text: "Before paying any provider, confirm its legal identity, the exact service offered, written fees and refund terms. OQC does not claim a UAE trade licence or local teaching-centre approval. A local directory or Google Business Profile must not be created for an online-only brand without meeting the platform’s real-world customer-contact eligibility rules.", path: "/refund-policy", link: "Read cancellation and refund terms" }
    ],
    sources: [
      { name: "UAE Government: licensing private educational institutes", url: "https://u.ae/en/information-and-services/education/licensing-private-educational-institutes" },
      { name: "Abu Dhabi Department of Economic Development: licensing requirements", url: "https://www.added.gov.ae/en/set-up/establish-your-business/licensing-requirements" },
      { name: "UAE Government: National Economic Register", url: "https://u.ae/en/information-and-services/business/important-digital-services/national-economic-register" },
      { name: "UAE Media Council: Advertiser Permit", url: "https://uaemc.gov.ae/en/news/" },
      { name: "Google Business Profile: eligibility", url: "https://support.google.com/business/answer/13763036?hl=en" }
    ]
  }
};
