import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Annual',
    Estimated: 1523411.80,
    Received: 800000,
    Due: 1450000,
  },
];

export default function FeeEstimatedCollectionChart() {
  return (
    <div className="h-[450px] w-full rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 100, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value) => `₹${(value / 100000).toFixed(2)} L`}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
          />
          <Bar dataKey="Estimated" fill="#fbbf24" radius={[8, 8, 0, 0]} animationDuration={900} />
          <Bar dataKey="Received" fill="#10b981" radius={[8, 8, 0, 0]} animationDuration={900} />
          <Bar dataKey="Due" fill="#f472b6" radius={[8, 8, 0, 0]} animationDuration={900} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
