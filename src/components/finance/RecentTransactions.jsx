const transactions = [
  { id: 1, name: 'AARTI KUMARI', college: 'Roorkee College of Smart Computing', date: '13/07/2026', amount: '₹1', mode: 'Cash' },
  { id: 2, name: 'AARTI KUMARI', college: 'Roorkee College of Smart Computing', date: '10/07/2026', amount: '₹5', mode: 'Cash' },
  { id: 3, name: 'AARTI KUMARI', college: 'Roorkee College of Smart Computing', date: '10/07/2026', amount: '₹9999', mode: 'Cash' },
  { id: 4, name: 'AARTI KUMARI', college: 'Roorkee College of Smart Computing', date: '29/06/2026', amount: '₹115', mode: 'Cash' },
  { id: 5, name: 'AARTI KUMARI', college: 'Roorkee College of Smart Computing', date: '29/06/2026', amount: '₹102', mode: 'Cash' },
  { id: 6, name: 'ROHIT SHARMA', college: 'Delhi University', date: '12/07/2026', amount: '₹5000', mode: 'Online' },
  { id: 7, name: 'PRIYA SINGH', college: 'IIT Delhi', date: '11/07/2026', amount: '₹3500', mode: 'Cheque' },
  { id: 8, name: 'AMIT PATEL', college: 'Mumbai University', date: '09/07/2026', amount: '₹7200', mode: 'Cash' },
  { id: 9, name: 'NEHA GUPTA', college: 'Bangalore Institute', date: '08/07/2026', amount: '₹4500', mode: 'Online' },
  { id: 10, name: 'VIKRAM REDDY', college: 'Hyderabad College', date: '07/07/2026', amount: '₹6000', mode: 'Cash' },
  { id: 11, name: 'POOJA VERMA', college: 'Chennai University', date: '06/07/2026', amount: '₹2500', mode: 'Online' },
  { id: 12, name: 'RAVI KUMAR', college: 'Kolkata Institute', date: '05/07/2026', amount: '₹5500', mode: 'Cheque' },
  { id: 13, name: 'SANJANA NAIR', college: 'Kochi University', date: '04/07/2026', amount: '₹3800', mode: 'Cash' },
  { id: 14, name: 'ARJUN SINGH', college: 'Pune College', date: '03/07/2026', amount: '₹8000', mode: 'Online' },
  { id: 15, name: 'DIVYA KAPOOR', college: 'Jaipur Institute', date: '02/07/2026', amount: '₹4200', mode: 'Cash' },
];

export default function RecentTransactions() {
  return (
    <div className="mt-4 max-h-[450px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between gap-3 rounded-[16px] border border-slate-200 bg-slate-50/80 p-3 hover:bg-slate-100/80 transition-colors"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 hover-gradient-border">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 hover-gradient-border">
                {transaction.name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{transaction.name}</p>
                <p className="text-xs text-slate-500 truncate">{transaction.college}</p>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-semibold text-slate-900">{transaction.amount}</p>
            <p className="text-xs text-slate-500">{transaction.date}</p>
          </div>
          <div className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 flex-shrink-0">
            {transaction.mode}
          </div>
        </div>
      ))}
    </div>
  );
}
