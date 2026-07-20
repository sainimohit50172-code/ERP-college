import { useMemo } from 'react';
import { FaChartLine, FaClipboardCheck, FaFileInvoiceDollar, FaUserPlus } from 'react-icons/fa';
import { useResourceList } from '../hooks/useResourceHooks';

export default function AdmissionsPage() {
  const { data: leadsData } = useResourceList('leads', { page: 1, pageSize: 200 });
  const leads = leadsData?.items || [];
  const { data: studentsData } = useResourceList('students', { page: 1, pageSize: 200 });
  const students = studentsData?.items || [];
  const { data: paymentsData } = useResourceList('feePayments', { page: 1, pageSize: 200 });
  const feePayments = paymentsData?.items || [];

  const metrics = useMemo(() => {
    const newApplications = leads.filter((lead) => lead.status === 'New').length;
    const offersSent = leads.filter((lead) => lead.stage === 'Counsellor' || lead.stage === 'Telecaller').length;
    const enrolled = students.length;
    const pendingDocuments = students.filter((student) => student.feeStatus !== 'Paid').length;
    const collection = feePayments.reduce((sum, payment) => sum + payment.amount, 0);

    return { newApplications, offersSent, enrolled, pendingDocuments, collection };
  }, [leads, students, feePayments]);

  return (
    <div className="space-y-6">
      <section className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Admissions</h1>
            <p className="mt-2 text-sm text-slate-400">Track applications, offer conversion, enrollment, and document completion with live ERP data.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200">
            <FaChartLine /> Admissions performance
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4 text-slate-200 shadow-sm">
            <div className="flex items-center gap-3 text-sky-300"><FaUserPlus /><span className="text-sm uppercase">New applications</span></div>
            <p className="mt-3 text-2xl font-semibold">{metrics.newApplications}</p>
          </div>
          <div className="hover-gradient-border rounded-[24px] border border-white/10 bg-slate-950/60 p-4 text-slate-200 shadow-sm">
            <div className="flex items-center gap-3 text-emerald-300"><FaClipboardCheck /><span className="text-sm uppercase">Offers sent</span></div>
            <p className="mt-3 text-2xl font-semibold">{metrics.offersSent}</p>
          </div>
          <div className="hover-gradient-border rounded-[24px] border border-white/10 bg-slate-950/60 p-4 text-slate-200 shadow-sm">
            <div className="flex items-center gap-3 text-violet-300"><FaUserPlus /><span className="text-sm uppercase">Enrolled</span></div>
            <p className="mt-3 text-2xl font-semibold">{metrics.enrolled}</p>
          </div>
          <div className="hover-gradient-border rounded-[24px] border border-white/10 bg-slate-950/60 p-4 text-slate-200 shadow-sm">
            <div className="flex items-center gap-3 text-rose-300"><FaFileInvoiceDollar /><span className="text-sm uppercase">Pending documents</span></div>
            <p className="mt-3 text-2xl font-semibold">{metrics.pendingDocuments}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Admission cash flow</h2>
            <p className="text-sm text-slate-400">Current fee collection and pending payment overview from student registrations.</p>
          </div>
          <div className="text-right">
            <p className="text-sm uppercase text-slate-400">Collected</p>
            <p className="mt-2 text-2xl font-semibold text-white">${metrics.collection.toLocaleString()}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
