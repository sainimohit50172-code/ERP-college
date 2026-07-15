import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const courseData = [
  { college: 'Roorkee College of Smart Computing', total: 1050, approved: 950 },
  { college: 'Roorkee College of Business Studies', total: 800, approved: 720 },
  { college: 'ROORKEE COLLEGE OF ENGINEERING', total: 0, approved: 0 },
  { college: 'Roorkee College of Engineering', total: 280, approved: 240 },
  { college: 'Roorkee College of Agricultural Sciences', total: 130, approved: 110 },
  { college: 'Roorkee College of Allied Health Sciences', total: 109, approved: 95 },
];

export default function AdmissionCourseWiseChart() {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="text-xs font-semibold text-slate-900">{payload[0].payload.college}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.fill }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={420}>
      <BarChart 
        data={courseData} 
        margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis 
          dataKey="college" 
          stroke="#94a3b8" 
          style={{ fontSize: '11px' }}
          angle={-45}
          textAnchor="end"
          height={120}
        />
        <YAxis 
          label={{ value: 'No. Of Students', angle: -90, position: 'insideLeft' }}
          stroke="#94a3b8" 
          style={{ fontSize: '12px' }} 
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} />
        <Legend />
        <Bar 
          dataKey="total" 
          fill="#10b981" 
          name="Total"
          radius={[8, 8, 0, 0]}
          isAnimationActive={true}
          animationDuration={800}
        />
        <Bar 
          dataKey="approved" 
          fill="#a7efd8" 
          name="Approved"
          radius={[8, 8, 0, 0]}
          isAnimationActive={true}
          animationDuration={800}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
