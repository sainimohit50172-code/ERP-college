const defaulters = [
  {
    id: 1,
    name: 'Roorkee College of Smart Computing - B.Tech. Hons. AI-ML - C',
    amount: '₹174735',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 2,
    name: 'RAKI ROY (Fee Category: General)',
    rollNumber: '24101020050',
    college: 'Roorkee College of Smart Computing - B.Tech. Hons. AI-ML - D',
    amount: '₹172501',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 3,
    name: 'ASHMIT KUMAR MISHRA (Fee Category: General)',
    rollNumber: '24101020020',
    college: 'Roorkee College of Smart Computing - B.Tech. Hons. AI-ML - D',
    amount: '₹160001',
    image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 4,
    name: 'SURYADARSHI DAS (Fee Category: General)',
    rollNumber: '25144020009',
    college: 'Roorkee College of Business Studies - MBA (IIM Certification) - A',
    amount: '₹160000',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 5,
    name: 'ARYAN DEOL (Fee Category: General)',
    rollNumber: '25144020001',
    college: 'Roorkee College of Business Studies - MBA (IIM Certification) - A',
    amount: '₹160000',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 6,
    name: 'PRIYA SHARMA (Fee Category: General)',
    rollNumber: '24102010015',
    college: 'Delhi University - B.A English - B',
    amount: '₹125000',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 7,
    name: 'ROHIT KUMAR (Fee Category: SC)',
    rollNumber: '24103020008',
    college: 'IIT Delhi - B.Tech CSE - C',
    amount: '₹185000',
    image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 8,
    name: 'NEHA GUPTA (Fee Category: General)',
    rollNumber: '24104010022',
    college: 'Mumbai University - M.Com - A',
    amount: '₹95000',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 9,
    name: 'VIKRAM REDDY (Fee Category: OBC)',
    rollNumber: '24105020033',
    college: 'Bangalore Institute - B.Sc IT - B',
    amount: '₹140000',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 10,
    name: 'POOJA VERMA (Fee Category: General)',
    rollNumber: '24106010044',
    college: 'Chennai University - LL.B - C',
    amount: '₹110000',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 11,
    name: 'RAVI KUMAR (Fee Category: ST)',
    rollNumber: '24107020055',
    college: 'Kolkata Institute - B.Arch - B',
    amount: '₹155000',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 12,
    name: 'SANJANA NAIR (Fee Category: General)',
    rollNumber: '24108010066',
    college: 'Kochi University - B.Pharmacy - A',
    amount: '₹125000',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 13,
    name: 'ARJUN SINGH (Fee Category: General)',
    rollNumber: '24109020077',
    college: 'Pune College - MBA - B',
    amount: '₹195000',
    image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 14,
    name: 'DIVYA KAPOOR (Fee Category: General)',
    rollNumber: '24110010088',
    college: 'Jaipur Institute - B.E Mechanical - D',
    amount: '₹150000',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 15,
    name: 'ADITYA PATEL (Fee Category: OBC)',
    rollNumber: '24111020099',
    college: 'Lucknow University - M.A History - C',
    amount: '₹105000',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
];

export default function TopDefaulters() {
  return (
    <div className="max-h-[550px] space-y-3 overflow-y-auto pr-1 custom-scrollbar">
      {defaulters.map((defaulter) => (
        <div
          key={defaulter.id}
          className="flex items-start gap-3 rounded-[16px] border border-slate-200 bg-white p-4 hover:shadow-md transition-all hover:scale-102 cursor-pointer"
        >
          <img
            src={defaulter.image}
            alt={defaulter.name}
            className="h-14 w-14 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 line-clamp-2">{defaulter.name}</p>
            {defaulter.rollNumber && (
              <p className="text-xs text-slate-500 mt-0.5">
                <span className="font-medium">Roll Number:</span> {defaulter.rollNumber}
              </p>
            )}
            {defaulter.college && (
              <p className="text-xs text-slate-600 mt-1 line-clamp-1">{defaulter.college}</p>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-sm font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
              {defaulter.amount}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
