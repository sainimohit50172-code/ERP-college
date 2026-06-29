import { useMemo } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import { useResourceList, useCreateResource, useUpdateResource } from '../hooks/useResourceHooks';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
export default function LeadsPage() {
  const { data: leadsData } = useResourceList('leads', { page: 1, pageSize: 200 });
  const leads = leadsData?.items || [];
  const { data: employeesData } = useResourceList('employees', { page: 1, pageSize: 200 });
  const employees = employeesData?.items || [];
  const { data: coursesData } = useResourceList('courses', { page: 1, pageSize: 200 });
  const courses = coursesData?.items || [];
  const createStudent = useCreateResource('students');
  const updateLead = useUpdateResource('leads');
  const convertLeadToStudent = async (leadId) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const studentPayload = { name: lead.name, courseId: lead.courseId, source: lead.source };
    createStudent.mutate(studentPayload, {
      onSuccess: () => {
        updateLead.mutate({ id: leadId, payload: { status: 'Admission Confirmed' } });
      },
    });
  };
  const leadMetrics = useMemo(() => {
    return {
      hotLeads: leads.filter((lead) => lead.expectedConversion === 'High').length,
      followUps: leads.filter((lead) => lead.status === 'Follow-up').length,
      newEnquiries: leads.filter((lead) => lead.status === 'New').length,
      confirmed: leads.filter((lead) => lead.status === 'Admission Confirmed').length,
    };
  }, [leads]);
  const leadRows = useMemo(
    () =>
      leads.map((lead) => {
        const course = courses.find((course) => course.id === lead.courseId);
        const assigned = employees.find((employee) => employee.id === lead.assignedToId);
        return [
          <div className="space-y-1" key={lead.id}>
            <p className="font-semibold text-white">{lead.name}</p>
            <p className="text-sm text-slate-400">{course?.title || 'N/A'}</p>
          </div>,
          assigned?.name || 'Unassigned',
          lead.source,
          lead.stage,
          <StatusBadge key={`${lead.id}-status`} status={lead.status} />,
          <button
            key={`${lead.id}-convert`}
            type="button"
            disabled={lead.status === 'Admission Confirmed'}
            onClick={() => convertLeadToStudent(lead.id)}
            className="rounded-3xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {lead.status === 'Admission Confirmed' ? 'Converted' : 'Convert'}
          </button>,
        ];
      }),
    [leads, employees, courses, convertLeadToStudent]
  );
  return (
    <div className="space-y-8">
      <SectionHeader title="Admission leads" subtitle="CRM-driven inquiry management with admissions conversion workflows." />
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Hot leads</p>
          <p className="mt-4 text-3xl font-semibold text-white">{leadMetrics.hotLeads}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Follow ups</p>
          <p className="mt-4 text-3xl font-semibold text-white">{leadMetrics.followUps}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">New enquiries</p>
          <p className="mt-4 text-3xl font-semibold text-white">{leadMetrics.newEnquiries}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Converted</p>
          <p className="mt-4 text-3xl font-semibold text-white">{leadMetrics.confirmed}</p>
        </div>
      </div>
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Lead pipeline</h2>
            <p className="text-sm text-slate-400">Review active leads and move qualified enquiries into ERP admissions profiles.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-2 text-sm text-slate-200">
            <FaClipboardList /> {leads.length} active leads
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <DataTable
            columns={['Name', 'Assigned', 'Source', 'Stage', 'Status', 'Action']}
            rows={leadRows}
          />
        </div>
      </div>
    </div>
  );
}