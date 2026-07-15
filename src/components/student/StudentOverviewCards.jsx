import { Users, UserCheck, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentOverviewCards({ title, stats = [], bgColor = 'bg-cyan-100', borderColor = 'border-cyan-300', textColor = 'text-cyan-700', totalValue = '1406', accentColor = 'bg-cyan-400' }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    console.log(`Clicked: ${title}`);
    if (title === 'Active Student') navigate('/students/active');
    else if (title === 'Inactive Student') navigate('/students/inactive');
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`cursor-pointer rounded-[24px] ${bgColor} border ${borderColor} p-6 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105`}>
      {/* Decorative element */}
      <div className="absolute top-4 right-4 opacity-10">
        <Users className="h-24 w-24" />
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4">
          <p className={`text-sm font-semibold ${textColor}`}>{title}</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-1">Total : {totalValue}</h2>
        </div>

        {/* Stats Grid */}
        <div className="flex justify-between items-end gap-3">
          {stats.map((item, idx) => {
            const icons = [<UserCheck key="male" className="h-6 w-6 mb-2" />, <Users key="female" className="h-6 w-6 mb-2" />, <UserX key="others" className="h-6 w-6 mb-2" />];
            return (
              <div key={item.label} className="text-center">
                <div className={`${textColor} mb-2`}>{icons[idx] || icons[0]}</div>
                <p className="text-xs font-medium text-slate-700 mb-1">{item.label}</p>
                <p className="text-lg font-bold text-slate-900">{item.value}</p>
                {item.percentage && <p className="text-xs text-slate-600 mt-0.5">{item.percentage}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
