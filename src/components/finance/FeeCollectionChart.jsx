import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { date: 'Jun 30', amount: 0 },
  { date: 'Jul 1', amount: 0 },
  { date: 'Jul 2', amount: 0 },
  { date: 'Jul 3', amount: 0 },
  { date: 'Jul 4', amount: 0 },
  { date: 'Jul 5', amount: 0 },
  { date: 'Jul 6', amount: 0 },
  { date: 'Jul 7', amount: 0 },
  { date: 'Jul 8', amount: 0 },
  { date: 'Jul 9', amount: 0 },
  { date: 'Jul 10', amount: 9800 },
  { date: 'Jul 11', amount: 0 },
  { date: 'Jul 12', amount: 0 },
  { date: 'Jul 13', amount: 0 },
  { date: 'Jul 14', amount: 0 },
  { date: 'Jul 15', amount: 0 },
];

const COLORS = data.map(d => d.amount > 0 ? '#10b981' : '#e5e7eb');

export default function FeeCollectionChart() {
  return (
    <div className="h-[400px] w-full rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            width={40}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Bar dataKey="amount" radius={[8, 8, 0, 0]} animationDuration={900}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
