export function calculateInternalMarkSummary(values = {}) {
  const assignment1 = Number(values.assignment1 || 0);
  const assignment2 = Number(values.assignment2 || 0);
  const midTerm = Number(values.midTerm || 0);
  const presentation = Number(values.presentation || 0);

  const total = assignment1 + assignment2 + midTerm + presentation;
  const percentage = total > 0 ? Math.round((total / 50) * 100) : 0;

  return {
    total,
    percentage: `${percentage}%`,
  };
}
