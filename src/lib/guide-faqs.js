// Short, direct answers for the learning guides (shown on the page and as FAQPage data).
// Same rule as the course FAQs: state only what is true for every learner; no promised
// timelines, prices or results. Each answer opens with the direct answer for AI/search snippets.
export const GUIDE_FAQS = {
  tajweed: [
    ["What is Tajweed?", "Tajweed is the set of rules for pronouncing the Quran correctly: where each letter is produced, its qualities, and rules such as lengthening and merging. It is learned by listening to a teacher, reciting, and correcting one point at a time."],
    ["Can I learn Tajweed online?", "Yes. In a live one-to-one lesson the teacher hears every letter you recite and corrects it straight away, which is how Tajweed is usually taught. A clear microphone and a quiet room help the teacher hear small differences."],
    ["Do I need to finish Noorani Qaida before Tajweed?", "Not always. If you can already read Arabic letters and join them, the teacher may start you on Quran reading with Tajweed. If letters or joining are unsure, Noorani Qaida comes first. A trial lesson is used to check the starting point."],
    ["How long does it take to learn Tajweed?", "It depends on your starting level, how many lessons a week you take and how much you practise between them. The teacher sets the next rule to practise each lesson and reviews progress with you rather than promising a fixed finish date."],
  ],
  "quran-for-kids": [
    ["What age can a child start online Quran classes?", "Many children start once they can sit with a teacher for a short lesson and follow simple instructions. The teacher checks readiness in the trial and adjusts the pace, and a parent nearby helps younger children settle."],
    ["Should my child start with Noorani Qaida?", "Most beginners start with Noorani Qaida, which teaches Arabic letters, sounds and joining before Quran reading. Children who already read fluently may move to Quran reading with Tajweed after the teacher checks their level."],
    ["How can parents help between lessons?", "Ask the teacher for one page and one correction to practise, keep practice short and regular, and listen to your child read it back. Share what was difficult at the next lesson."],
  ],
  "quran-for-adults": [
    ["Is it too late to learn Quran as an adult?", "No. Adults can start from the first letters with Noorani Qaida or return after a long break. One-to-one lessons go at your pace, and you can ask for a female or male teacher."],
    ["Where should an adult beginner start?", "If you cannot yet read Arabic letters, start with Noorani Qaida. If you can read but are unsure of rules, start with Quran reading with Tajweed. The trial lesson is used to agree the starting point."],
    ["How much time do adult learners need each week?", "Choose a package that fits your week and keep a short daily practice of the task the teacher sets. Regular short practice usually helps more than one long session."],
  ],
  "islamic-studies-for-kids": [
    ["What do Islamic studies classes for children cover?", "Lessons cover age-appropriate topics such as daily duas, the basics of salah, manners and selected Hadith. The teacher confirms the materials and scope for your child's age and language before enrolment."],
    ["Can Islamic studies be taken alongside Quran reading?", "Yes. Many families combine a Quran reading or Qaida course with Islamic studies. Discuss the weekly timetable with the coordinator so the load suits the child."],
  ],
};

export function guideFaqs(topic) {
  return (GUIDE_FAQS[topic] || []).map(([question, answer], i) => ({ id: `guide-${topic}-${i}`, question, answer }));
}
