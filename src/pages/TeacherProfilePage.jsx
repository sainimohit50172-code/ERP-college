import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTeacherProfile } from '../services/teacherProfileService.js';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import MemberLibraryTab from '../components/library/MemberLibraryTab.jsx';

export default function TeacherProfilePage() {
  const { teacherId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const teacherQuery = useQuery({
    queryKey: ['teacherProfile', teacherId],
    queryFn: () => getTeacherProfile(teacherId),
    enabled: Boolean(teacherId),
  });

  if (teacherQuery.isLoading) return <div className="p-6">Loading faculty profile...</div>;
  if (teacherQuery.isError || !teacherQuery.data) return <div className="p-6 text-red-600">Faculty not found.</div>;

  const teacher = teacherQuery.data;

  return (
    <div className="space-y-4 p-3 sm:space-y-6 sm:p-4 lg:p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Faculty Profile</h1>
            <p className="text-sm text-slate-600">{teacher.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={teacher.status || 'Active'} />
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">ID: {teacher.id}</div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex gap-2">
          {['overview', 'library'].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`rounded-2xl border px-4 py-2 text-sm ${activeTab === t ? 'bg-slate-900 text-white' : ''}`}>{t === 'library' ? 'Library' : 'Overview'}</button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        {activeTab === 'library' ? <MemberLibraryTab memberId={teacher.id} memberType="teacher" /> : (
          <div className="responsive-card-grid gap-4">
            <div className="card p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold">Profile Summary</h3>
              <p className="mt-2 text-sm text-slate-600">Name: {teacher.name}</p>
            </div>
            <div className="card p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold">Status</h3>
              <StatusBadge status={teacher.status || 'Active'} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
