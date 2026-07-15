import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const sourceData = [
  { name: 'COLLEGE DUNIA', value: 600, fill: '#3b82f6' },
  { name: 'COLLEGE DEKHO', value: 500, fill: '#f59e0b' },
  { name: 'ZOLLEGE', value: 420, fill: '#10b981' },
  { name: 'COLLEGEHAI', value: 280, fill: '#ec4899' },
  { name: 'SHIKSHA', value: 210, fill: '#8b5cf6' },
  { name: 'GOOGLE-AD', value: 180, fill: '#06b6d4' },
  { name: 'CAMPUS VISIT', value: 95, fill: '#f97316' },
  { name: 'KOLLEGEAPPLY', value: 42, fill: '#6366f1' },
  { name: 'REGISTRATION(HU)', value: 28, fill: '#d946ef' },
  { name: 'FACEBOOK', value: 14, fill: '#0891b2' },
  { name: 'HUWEB', value: 0, fill: '#64748b' },
];

export default function SourceWiseAdmissionChart() {
  const [visibleSources, setVisibleSources] = useState(new Set(sourceData.map(s => s.name)));

  const filteredData = useMemo(() => {
    return sourceData.filter(item => visibleSources.has(item.name));
  }, [visibleSources]);

  const total = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.value, 0);
  }, [filteredData]);

  const handleLegendClick = (entry) => {
    setVisibleSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entry.payload.name)) {
        newSet.delete(entry.payload.name);
      } else {
        newSet.add(entry.payload.name);
      }
      return newSet;
    });
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / sourceData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="text-sm font-semibold text-slate-900">{data.name}</p>
          <p className="text-sm font-bold text-slate-900">{data.value} enquiries</p>
          <p className="text-xs text-slate-500">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
            isAnimationActive={true}
            animationDuration={800}
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center">
        <p className="text-sm text-slate-500">Total</p>
        <p className="text-4xl font-bold text-slate-900">{total}</p>
      </div>
      <Legend 
        onClick={(e) => handleLegendClick(e.entry)}
        wrapperStyle={{ cursor: 'pointer', paddingTop: '20px' }}
        layout="vertical"
        align="center"
        verticalAlign="bottom"
        height={36}
      />
    </div>
  );
}
