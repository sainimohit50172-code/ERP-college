export const GRADE_SCALE = [
  { min: 90, grade: 'A+', description: 'Outstanding' },
  { min: 80, grade: 'A', description: 'Excellent' },
  { min: 70, grade: 'B+', description: 'Very Good' },
  { min: 60, grade: 'B', description: 'Good' },
  { min: 50, grade: 'C', description: 'Satisfactory' },
  { min: 40, grade: 'D', description: 'Pass' },
  { min: 0, grade: 'F', description: 'Fail' },
];

export function calculateGrade(total, maxMarks = 500) {
  const percentage = maxMarks ? (total / maxMarks) * 100 : 0;
  const match = GRADE_SCALE.find((entry) => percentage >= entry.min);
  return match ? match.grade : 'F';
}

export function calculateResultMetrics({ internal = 0, external = 0, practical = 0, assignment = 0, attendance = 0, grace = 0 }) {
  const total = Number(internal) + Number(external) + Number(practical) + Number(assignment) + Number(attendance) + Number(grace);
  const percentage = total ? Number((total / 500) * 100).toFixed(1) : '0.0';
  const grade = calculateGrade(total, 500);
  const status = grade === 'F' ? 'Fail' : 'Pass';
  return {
    total,
    percentage: Number(percentage),
    grade,
    status,
    sgpa: Number((Number(percentage) / 10).toFixed(1)),
    cgpa: Number((Number(percentage) / 10).toFixed(1)),
    rank: 0,
    backPaper: grade === 'F',
    merit: grade === 'A+' || grade === 'A' ? 'Merit' : 'Standard',
  };
}

export function buildResultSummary(results = []) {
  return {
    total: results.length,
    pass: results.filter((result) => result.status === 'Pass').length,
    fail: results.filter((result) => result.status === 'Fail').length,
    average: results.length ? Number((results.reduce((sum, item) => sum + Number(item.percentage || 0), 0) / results.length).toFixed(1)) : 0,
  };
}
