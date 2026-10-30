// Original short guidance. Offers and teacher availability remain coordinator-confirmed.
export const MARKET_GUIDES = {
  "united-kingdom": {
    title: "Planning Quran lessons around UK family life",
    sections: [
      { title: "Keep the learner’s local time clear", text: "Share a realistic lesson window around school, work and rest. The UK moves between GMT and British Summer Time; choose a date in the planner and ask how a recurring lesson will be handled when clocks change. The comparison helps you enquire; a coordinator confirms the timetable.", path: "/free-trial?country=United+Kingdom&currency=GBP", link: "Discuss a UK lesson time" },
      { title: "Choose support before a package", text: "For a child, describe the letters or passages they can currently read. Adults can explain whether they are beginning or returning after a break. Compare the learning goals, then confirm the GBP fee, lesson frequency and teacher preference with the team.", path: "/learn/quran-for-kids", link: "Read the parent’s starting guide" },
    ],
    sources: [{ name: "GOV.UK: UK clock changes", url: "https://www.gov.uk/when-do-the-clocks-change" }],
  },
  canada: {
    title: "Planning Quran lessons across Canadian local clocks",
    sections: [
      { title: "Use your city and the actual lesson date", text: "Canada does not have one national clock rule. The planner includes Atlantic, Newfoundland and central examples as well as the listed city guides. Vancouver and Alberta remain on year-round local time from November 2026; Toronto follows a different rule. Check your own city before proposing a recurring lesson.", path: "/free-trial?country=Canada&currency=CAD", link: "Discuss a Canadian lesson time" },
      { title: "Confirm the course and the CAD quote", text: "Explain whether the learner needs first-letter support, guided Quran reading, memorisation or understanding. Ask which teaching language and teacher preference can be accommodated. Check the written CAD fee, weekly lesson frequency and rescheduling terms; a currency label does not confirm a local price or available slot.", path: "/courses", link: "Compare the course goals" },
    ],
    sources: [
      { name: "National Research Council: provincial clock guidance", url: "https://www.cnrc.canada.ca/en/certifications-evaluations-standards/canadas-official-time/time-zones-daylight-saving-time" },
      { name: "British Columbia: Pacific time", url: "https://www2.gov.bc.ca/gov/content/governments/celebrating-british-columbia/daylight-saving-time" },
      { name: "Alberta: the new time system", url: "https://www.alberta.ca/albertas-new-time-system-abt" },
    ],
  },
  australia: {
    title: "Australian lesson times: state clocks and daylight saving",
    sections: [
      { title: "Check your state’s daylight saving rule", text: "Australia has several local clocks, and states decide daylight saving themselves. New South Wales, Victoria, South Australia, Tasmania and the ACT move their clocks; Queensland, Western Australia and the Northern Territory do not. A lesson fixed in Sydney time can therefore shift by an hour for a family in Brisbane or Perth. Pick your city and the actual lesson date in the planner before proposing a weekly time.", path: "/free-trial?country=Australia&currency=AUD", link: "Discuss an Australian lesson time" },
      { title: "Fit lessons around school and work", text: "Tell the coordinator which after-school, evening or weekend window suits the learner, and whether a child needs a parent nearby during the trial. Describe what they can already read, whether Noorani Qaida, guided Quran reading with Tajweed or memorisation, then confirm the AUD fee, weekly frequency and rescheduling terms in writing.", path: "/blog/quran-lessons-australia-time-zones", link: "Read the Australian time-zone guide" },
    ],
    sources: [
      { name: "Fair Work Ombudsman: daylight saving in Australia", url: "https://www.fairwork.gov.au/tools-and-resources/library/K600489_Daylight-saving-in-Australia" },
      { name: "NSW Communities and Justice: daylight saving", url: "https://dcj.nsw.gov.au/about-us/daylight-saving.html" },
    ],
  },
};
