import { Cake, GraduationCap, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const students = [
  { name: 'Aarav Sharma', college: 'Main Campus', course: 'B.Tech', semester: 'Sem 5', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', badge: 'Birthday' },
  { name: 'Nisha Patel', college: 'Science College', course: 'BBA', semester: 'Sem 3', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', badge: 'Birthday' },
  { name: 'Rohan Mehta', college: 'Engineering Campus', course: 'MBA', semester: 'Sem 1', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', badge: 'Anniversary' },
  { name: 'Sana Khan', college: 'Arts College', course: 'BA', semester: 'Sem 6', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', badge: 'Birthday' },
  { name: 'Kunal Rao', college: 'Commerce College', course: 'B.Com', semester: 'Sem 4', image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=300&q=80', badge: 'Anniversary' },
  { name: 'Meera Iyer', college: 'Law College', course: 'LLB', semester: 'Sem 2', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', badge: 'Birthday' },
  { name: 'Aditya Das', college: 'Medical College', course: 'MBBS', semester: 'Sem 8', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', badge: 'Birthday' },
  { name: 'Priya Verma', college: 'Management College', course: 'BCA', semester: 'Sem 7', image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80', badge: 'Anniversary' },
];

export default function BirthdayWidget() {
  const navigate = useNavigate();

  const handleStudentClick = (studentName) => {
    console.log(`Viewing student profile: ${studentName}`);
    navigate(`/student-profile/${studentName.replace(/\s+/g, '-').toLowerCase()}`);
  };

  return (
    <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Today's Birthdays & Anniversaries</h3>
          <p className="mt-1 text-sm text-slate-500">A warm celebration for campus milestones</p>
        </div>
        <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
          <Cake className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 max-h-[400px] space-y-3 overflow-y-auto pr-1">
        {students.map((student) => (
          <div 
            key={student.name} 
            onClick={() => handleStudentClick(student.name)}
            className="cursor-pointer flex items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50/80 p-3 transition-all duration-300 hover:bg-slate-100 hover:shadow-md hover:scale-102"
          >
            <img src={student.image} alt={student.name} className="h-12 w-12 rounded-full object-cover transition-transform hover:scale-110" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="truncate text-sm font-semibold text-slate-900 hover:underline">{student.name}</div>
                <div className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-700">
                  {student.badge}
                </div>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{student.college}</span>
                <span className="flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5" />{student.course}</span>
                <span>{student.semester}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
