import { BookOpen, GraduationCap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OverviewCards() {
  const navigate = useNavigate();

  const cards = [
    { label: 'App Students', value: '1,406', subtitle: 'Applications approved', icon: GraduationCap },
    { label: 'Dormant Students', value: '78', subtitle: 'Inactive in 7 days', icon: BookOpen },
  ];

  const handleCardClick = (label) => {
    console.log(`Clicked: ${label}`);
    if (label === 'App Students') navigate('/students/approved');
    else if (label === 'Dormant Students') navigate('/students/dormant-detail');
  };

  const handleWellnessClick = () => {
    console.log('Viewing wellness analytics');
    navigate('/wellness/analytics');
  };

  return (
    <div className="grid gap-4">
      {cards.map((card) => (
        <div 
          key={card.label} 
          onClick={() => handleCardClick(card.label)}
          className="cursor-pointer rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)] transition-all duration-300 hover:shadow-[0_24px_60px_-16px_rgba(15,23,42,0.45)] hover:scale-105">
          <div className="flex items-center justify-between gap-3 hover-gradient-border">
            <div>
              <div className="text-sm font-semibold text-slate-500">{card.label}</div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</div>
              <div className="mt-2 text-sm text-slate-500">{card.subtitle}</div>
            </div>
            <div className="rounded-2xl bg-slate-900 p-3 text-white transition-colors hover:bg-slate-800">
              {card.icon === GraduationCap ? <GraduationCap className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
            </div>
          </div>
        </div>
      ))}
      <div 
        onClick={handleWellnessClick}
        className="cursor-pointer rounded-[22px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-5 text-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.45)] transition-all duration-300 hover:shadow-[0_28px_70px_-16px_rgba(15,23,42,0.55)] hover:scale-105 hover-gradient-border">
        <div className="flex items-center justify-between gap-3 hover-gradient-border">
          <div>
            <div className="text-sm font-semibold text-slate-300">Student wellness</div>
            <div className="mt-2 text-3xl font-semibold">92%</div>
            <div className="mt-2 text-sm text-slate-400">Wellness score this term</div>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 transition-colors hover:bg-white/25">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
