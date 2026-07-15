const courseData = [
  { id: 1, college: 'Roorkee College of Allied Health Sciences', course: 'B.Sc. Nursing', batch: 'Sem 3', section: 'A', demand: '15,000', dueAmount: '15,000', duePercentage: '100%' },
  { id: 2, college: 'Roorkee College of Allied Health Sciences', course: 'B.Sc. Nursing', batch: 'Sem 3', section: 'A', demand: '15,000', dueAmount: '15,000', duePercentage: '100%' },
  { id: 3, college: 'Roorkee College of Allied Health Sciences', course: 'B.Sc. Nursing', batch: 'Sem 3', section: 'A', demand: '15,000', dueAmount: '15,000', duePercentage: '100%' },
  { id: 4, college: 'Roorkee College of Allied Health Sciences', course: 'B.Sc. Nursing', batch: 'Sem 3', section: 'A', demand: '15,000', dueAmount: '15,000', duePercentage: '100%' },
  { id: 5, college: 'Roorkee College of Allied Health Sciences', course: 'B.Sc. Nursing', batch: 'Sem 3', section: 'A', demand: '15,000', dueAmount: '15,000', duePercentage: '100%' },
  { id: 6, college: 'Delhi University', course: 'B.A. English', batch: 'Sem 2', section: 'B', demand: '12,000', dueAmount: '8,000', duePercentage: '66.67%' },
  { id: 7, college: 'IIT Delhi', course: 'B.Tech CSE', batch: 'Sem 4', section: 'C', demand: '25,000', dueAmount: '5,000', duePercentage: '20%' },
  { id: 8, college: 'Mumbai University', course: 'M.Com', batch: 'Sem 1', section: 'A', demand: '18,000', dueAmount: '18,000', duePercentage: '100%' },
  { id: 9, college: 'Bangalore Institute', course: 'B.Sc IT', batch: 'Sem 3', section: 'B', demand: '16,000', dueAmount: '10,000', duePercentage: '62.5%' },
  { id: 10, college: 'Hyderabad College', course: 'B.Pharmacy', batch: 'Sem 2', section: 'A', demand: '20,000', dueAmount: '20,000', duePercentage: '100%' },
  { id: 11, college: 'Chennai University', course: 'LL.B', batch: 'Sem 3', section: 'C', demand: '14,000', dueAmount: '0', duePercentage: '0%' },
  { id: 12, college: 'Kolkata Institute', course: 'B.Arch', batch: 'Sem 5', section: 'B', demand: '22,000', dueAmount: '22,000', duePercentage: '100%' },
  { id: 13, college: 'Pune College', course: 'MBA', batch: 'Sem 2', section: 'A', demand: '35,000', dueAmount: '35,000', duePercentage: '100%' },
  { id: 14, college: 'Jaipur Institute', course: 'B.E Mechanical', batch: 'Sem 4', section: 'D', demand: '24,000', dueAmount: '12,000', duePercentage: '50%' },
  { id: 15, college: 'Lucknow University', course: 'M.A History', batch: 'Sem 1', section: 'B', demand: '11,000', dueAmount: '11,000', duePercentage: '100%' },
];

export default function CourseWiseFeeDue() {
  return (
    <div className="mt-4 max-h-[550px] overflow-x-auto overflow-y-auto rounded-lg border border-slate-200">
      <table className="w-full">
        <thead className="sticky top-0">
          <tr className="bg-gradient-to-r from-rose-400 to-pink-400 text-white">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.24em] whitespace-nowrap">College</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.24em] whitespace-nowrap">Course</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.24em] whitespace-nowrap">Batch</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.24em] whitespace-nowrap">Section</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.24em] whitespace-nowrap">Demand</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.24em] whitespace-nowrap">Due Amount</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.24em] whitespace-nowrap">Due %</th>
          </tr>
        </thead>
        <tbody>
          {courseData.map((row, index) => (
            <tr
              key={row.id}
              className={`border-b border-slate-200 transition-colors hover:bg-slate-50 ${
                index % 2 === 0 ? 'bg-white' : 'bg-rose-50/50'
              }`}
            >
              <td className="px-4 py-3 text-sm text-slate-900 font-medium">{row.college}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{row.course}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{row.batch}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{row.section}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{row.demand}</td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-900">{row.dueAmount}</td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-900">{row.duePercentage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
