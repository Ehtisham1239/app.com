// Editorial navigation uses existing resources; no new religious claims or credentials.
export const COURSE_SUPPORT = {
  'noorani-qaida': [
    ['/blog/noorani-qaida-home-practice-checklist', 'Plan Noorani Qaida practice with the teacher', 'Use a short checklist to clarify the assigned page, correction and next practice task.'],
    ['/blog/noorani-qaida-or-quran-reading', 'Compare Qaida with Quran reading', 'Discuss the learner’s starting point before choosing a course.'],
    ['/courses/tajweed', 'Understand the Tajweed learning path', 'See how listening and teacher feedback support pronunciation practice.'],
  ],
  'quran-nazara': [
    ['/courses/tajweed', 'Prepare for Quran reading with Tajweed', 'Read the guide to listening, correction and manageable practice.'],
    ['/blog/tajweed-practice-with-feedback', 'Turn teacher feedback into practice', 'Keep the next task specific and ask the teacher to check it.'],
    ['/blog/noorani-qaida-or-quran-reading', 'Choose a suitable reading starting point', 'Compare reading foundations with supported Quran reading.'],
  ],
  'hifz-quran': [
    ['/blog/memorization-techniques-for-beginners', 'Plan a first memorisation task', 'Discuss reading accuracy, recall and review with your Hifz teacher.'],
    ['/blog/hifz-revision-with-school', 'Balance Hifz revision and school', 'Prepare questions about a manageable new-learning and revision routine.'],
    ['/blog/parent-teacher-quran-progress-review', 'Review progress with the teacher', 'Use a learning sample and feedback rather than page totals alone.'],
  ],
  'arabic-language': [
    ['/blog/quran-translation-and-arabic-difference', 'Compare Arabic study and Quran translation', 'Clarify whether your aim is language skills or discussing meaning through translation.'],
    ['/courses/quran-translation', 'Explore the translation and Tafseer course', 'Compare the stated learning goals before selecting your course.'],
    ['/blog/questions-before-quran-course-enrolment', 'Prepare your enrolment questions', 'Ask about current level, materials, teaching language and lesson times.'],
  ],
  'quran-translation': [
    ['/blog/quran-translation-and-arabic-difference', 'Understand translation and Arabic learning goals', 'Use this comparison to discuss the kind of learning support you need.'],
    ['/courses/arabic-language', 'Compare the Arabic language course', 'Check the course outline against your language-learning goals.'],
    ['/blog/questions-before-quran-course-enrolment', 'Ask about materials and course suitability', 'Agree the scope with the coordinator and teacher before enrolling.'],
  ],
  'hadith-translation': [
    ['/learn/islamic-studies-for-kids', 'Discuss Islamic learning for a child', 'Prepare questions about age, language, materials and parent support.'],
    ['/blog/questions-before-quran-course-enrolment', 'Review questions before enrolment', 'Clarify course goals, materials and the teacher’s feedback process.'],
    ['/blog/parent-teacher-quran-progress-review', 'Prepare a parent–teacher progress conversation', 'Agree a clear next step from an actual learning sample.'],
  ],
};

export const COURSE_QUESTIONS = {
  'noorani-qaida': [
    ['Should I choose Qaida or Quran reading?', 'Describe which letters and short passages the learner can read. Ask the teacher to check the starting point before selecting Qaida or supported Quran reading.'],
    ['How can a parent support Qaida practice?', 'Ask for the exact page and one correction to practise. Follow the teacher’s task and request clarification when the learner is unsure.'],
  ],
  'quran-nazara': [
    ['What should I share before a reading trial?', 'Explain what the learner can read independently and where they need help. A short reading sample helps the teacher discuss a suitable starting point.'],
    ['How should I use reading feedback between lessons?', 'Write down the passage and the correction agreed with the teacher. Ask for a demonstration when a written note does not explain the sound clearly.'],
  ],
  'hifz-quran': [
    ['How do we discuss Hifz alongside school or work?', 'Share the time realistically available for both new memorisation and revision. Agree a manageable routine with the teacher rather than a promised completion date.'],
    ['What should a Hifz progress review cover?', 'Discuss recall of an agreed sample, corrections and the revision task. Pages completed alone do not describe the learner’s next support need.'],
  ],
  'arabic-language': [
    ['Is Arabic language study the same as Quran translation?', 'They have different learning goals. Compare the language course outline with the translation course and explain the reading, vocabulary or understanding support you are seeking.'],
    ['What should I ask about Arabic lesson materials?', 'Ask which materials fit your current level, which teaching language is available and how practice will be reviewed. Confirm these before enrolling.'],
  ],
  'quran-translation': [
    ['How do I choose between translation and Arabic study?', 'Explain whether you want to discuss meanings through translation or develop Arabic language skills. Compare the course goals with the teacher rather than treating the courses as interchangeable.'],
    ['What should I confirm before translation lessons?', 'Ask about the selected translation, explanation materials, teaching language and starting level. Discuss substantive religious questions with a qualified teacher.'],
  ],
  'hadith-translation': [
    ['How do I discuss whether this course suits a child?', 'Share the learner’s age, language and prior study, and ask which materials and parent support arrangements suit that starting point.'],
    ['What should I ask about Hadith and Islamic studies materials?', 'Ask the teacher to identify the texts, references and intended scope. Confirm how questions and progress feedback will be handled before enrolling.'],
  ],
};

export function supplementalCourseFaqs(slug, existing = []) {
  const known = new Set(existing.map(f => f.question.trim().toLowerCase()));
  return (COURSE_QUESTIONS[slug] || []).filter(([question]) => !known.has(question.toLowerCase())).map(([question, answer], i) => ({ id: `course-support-${slug}-${i}`, question, answer }));
}
