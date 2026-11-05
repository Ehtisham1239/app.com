export function calculateHifzPlan({ remainingPages, studyDaysPerWeek, revisionPages, revisionDaysPerWeek }) {
  const values = [remainingPages, studyDaysPerWeek, revisionPages, revisionDaysPerWeek];
  if (!values.every(Number.isInteger)) return { error: "Enter whole numbers for every field." };
  if (remainingPages < 1 || remainingPages > 10000) return { error: "Remaining pages must be between 1 and 10,000." };
  if (studyDaysPerWeek < 1 || studyDaysPerWeek > 7) return { error: "Choose 1–7 study days per week." };
  if (revisionPages < 0 || revisionPages > 10000) return { error: "Revision pages must be between 0 and 10,000." };
  if (revisionDaysPerWeek < 1 || revisionDaysPerWeek > 7) return { error: "Choose 1–7 revision days per week." };

  const newPagesPerStudyDay = Math.ceil(remainingPages / studyDaysPerWeek);
  const estimatedStudyDays = Math.ceil(remainingPages / newPagesPerStudyDay);
  const estimatedWeeks = Math.ceil(estimatedStudyDays / studyDaysPerWeek);
  const revisionPagesPerDay = revisionPages === 0 ? 0 : Math.ceil(revisionPages / revisionDaysPerWeek);

  return { newPagesPerStudyDay, estimatedStudyDays, estimatedWeeks, revisionPagesPerDay };
}
