import { Link } from 'react-router-dom';
import { CalendarDays, Plus, ChevronRight } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const sessions = [
  {
    id: 'session-2023-24',
    academicSession: '2023-24',
    startDate: '01 Jul 2023',
    endDate: '30 Jun 2024',
    status: 'Active',
    description: 'Current academic year with ongoing assessments and student promotions.',
  },
  {
    id: 'session-2024-25',
    academicSession: '2024-25',
    startDate: '01 Jul 2024',
    endDate: '30 Jun 2025',
    status: 'Planned',
    description: 'Next academic year with planned course updates and schedule finalization.',
  },
  {
    id: 'session-2022-23',
    academicSession: '2022-23',
    startDate: '01 Jul 2022',
    endDate: '30 Jun 2023',
    status: 'Completed',
    description: 'Completed session with final results published and certificate distribution.',
  },
];

export default function AcademicSessionListPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Breadcrumb
              items={[
                { label: 'Settings', to: '/settings' },
                { label: 'Institute Setup', to: '/settings/institute' },
                { label: 'Sessions' },
              ]}
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-emerald-600">Institute setup</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Academic Session List</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Manage academic years, session periods, and registration-ready terms in one place.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Session overview</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">3 academic sessions</h2>
            </div>
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border">
              <Plus className="h-4 w-4" /> Add session
            </button>
          </div>
          <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
              <thead>
                <tr className="text-left uppercase tracking-[0.12em] text-white">
                  <th className="px-4 py-4">Academic session</th>
                  <th className="px-4 py-4">Start date</th>
                  <th className="px-4 py-4">End date</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-sm">
                {sessions.map((session, index) => (
                  <tr key={session.id} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">{session.academicSession}</td>
                    <td className="whitespace-nowrap px-4 py-4">{session.startDate}</td>
                    <td className="whitespace-nowrap px-4 py-4">{session.endDate}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                      <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${session.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : session.status === 'Planned' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">{session.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <CalendarDays className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-semibold">Session helpers</h3>
          </div>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-900">Current session</p>
              <p className="mt-1">2023-24 is active and visible across academic scheduling and fee registrations.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Session rollover</p>
              <p className="mt-1">Prepare the next session before the current year ends to enable smooth admissions intake.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Session reports</p>
              <p className="mt-1">Generate academic session reports for progress tracking and compliance audits.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
