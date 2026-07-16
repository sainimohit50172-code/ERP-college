import { motion } from 'framer-motion';
import { ChevronRight, Users, CalendarDays, Apple, Home, RefreshCw } from 'lucide-react';

const stats = [
  { title: 'Total Registered Students', value: 0 },
  { title: 'Total Employees', value: 0 },
  { title: "Today's Total Entries", value: 0 },
  { title: 'Active Meal Types', value: 4 },
];

const activities = [
  { id: 1, title: 'Breakfast served', subtitle: 'Hall A • 08:15 AM' },
  { id: 2, title: 'Lunch menu published', subtitle: 'Vegetarian and Non-Veg' },
  { id: 3, title: 'Guest meal approval', subtitle: 'Pending from Mess Supervisor' },
];

export default function MessManagementDashboard() {
  return (
    <div className="min-h-[calc(100vh-120px)] overflow-x-hidden bg-transparent p-2 text-slate-900">
      <div className="m-2 rounded-[22px] border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Mess Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Overview of daily meal operations and activity.</p>
          </div>
          <button type="button" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {stats.map((item) => (
          <motion.button
            key={item.title}
            type="button"
            whileHover={{ y: -4 }}
            className="p-[1px] rounded-[20px]"
            style={{ background: 'linear-gradient(90deg,#facc15,#22c55e,#38bdf8,#a78bfa)' }}
            onClick={() => window.alert(`${item.title} clicked`)}
          >
            <div className="rounded-[19px] bg-white p-5 shadow-sm transition duration-200 hover:bg-slate-50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.title}</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-900">{item.value}</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 shadow-sm">
                  {item.title.includes('Meal') ? <Apple className="h-5 w-5" /> : item.title.includes('Employees') ? <Users className="h-5 w-5" /> : item.title.includes('Students') ? <Home className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="p-[1px] rounded-[22px]" style={{ background: 'linear-gradient(90deg,#38bdf8,#818cf8,#f472b6)' }}>
          <div className="rounded-[21px] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Today's Meal Distribution</h2>
                <p className="mt-1 text-sm text-slate-500">Live tracking for morning and evening meals.</p>
              </div>
              <button type="button" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" onClick={() => window.alert('View meal details clicked')}>
                View details
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[18px] border border-slate-200/80 bg-slate-50 p-4 shadow-sm">
                <p className="text-sm text-slate-500">Breakfast Served</p>
                <p className="mt-3 text-4xl font-bold text-slate-900">0</p>
                <p className="mt-2 text-xs text-slate-500">on time and ready</p>
              </div>
              <div className="rounded-[18px] border border-slate-200/80 bg-slate-50 p-4 shadow-sm">
                <p className="text-sm text-slate-500">Lunch Served</p>
                <p className="mt-3 text-4xl font-bold text-slate-900">0</p>
                <p className="mt-2 text-xs text-slate-500">planned menu items</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-[1px] rounded-[22px]" style={{ background: 'linear-gradient(90deg,#f97316,#e879f9,#10b981)' }}>
          <div className="rounded-[21px] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
                <p className="mt-1 text-sm text-slate-500">Latest mess operations and approvals.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Live</span>
            </div>

            <div className="mt-6 space-y-3">
              {activities.map((item) => (
                <motion.button
                  type="button"
                  key={item.id}
                  whileHover={{ x: 4 }}
                  className="w-full rounded-[18px] border border-slate-200/80 bg-slate-50 p-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-white"
                  onClick={() => window.alert(`${item.title} clicked`)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
