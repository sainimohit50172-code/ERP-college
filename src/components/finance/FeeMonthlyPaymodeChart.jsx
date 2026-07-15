import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Cash', value: 10005 },
];

const COLORS = ['#3b82f6'];

export default function FeeMonthlyPaymodeChart() {
  return (
    <div className="h-[320px] w-full flex flex-col items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={0}
            dataKey="value"
            animationDuration={900}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase">Total</p>
          <p className="text-2xl font-bold text-slate-900">10005</p>
        </div>
      </div>
      <div className="mt-4 flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
          <span className="text-slate-700">Cash</span>
          <span className="font-semibold text-slate-900">₹10005</span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
          <span className="text-xs text-slate-600">Receipts</span>
          <span className="font-bold text-slate-900">3</span>
        </div>
      </div>
    </div>
  );
}
