import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import { getMapping } from '../../services/subjectMappingV2Service.js';

function Badge({ children, bg, color }) {
  return (
    <div className="inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold" style={{ background: bg, color }}>
      {children}
    </div>
  );
}

export default function SubjectMappingV2ViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mapping, setMapping] = useState(null);

  useEffect(() => {
    const demo = getMapping(id);
    if (!demo) {
      navigate('/settings/institute/academics/subject-college-mapping-v2', { replace: true });
      return;
    }
    setMapping(demo);
  }, [id, navigate]);

  if (!mapping) {
    return null;
  }

  return (
    <div className="min-h-screen w-full min-w-0 px-4 pb-8 pt-4 lg:px-6">
      <div className="flex flex-col gap-4 pb-4">
        <div className="text-sm text-slate-400">
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/' },
              { label: 'Institute Setup', to: '/settings/institute' },
              { label: 'Academics', to: '/settings/institute/academics' },
              { label: 'Subject Mapping V2', to: '/settings/institute/academics/subject-college-mapping-v2' },
              { label: 'View' },
            ]}
          />
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-700">
              <Eye className="h-5 w-5" />
              <h1 className="text-3xl font-semibold">View Subject Mapping</h1>
            </div>
            <p className="mt-2 text-sm text-slate-500">Review the subject college mapping details in read-only mode.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link to="/settings/institute/academics/subject-college-mapping-v2">
              <Button variant="secondary" className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to list
              </Button>
            </Link>
            <Button variant="primary" className="inline-flex items-center gap-2" onClick={() => navigate(`/settings/institute/academics/subject-college-mapping/view/${mapping.id}`)}>
              Edit mapping
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">College</div>
              <div className="text-lg font-semibold text-slate-900">{mapping.college}</div>
            </div>
            <div className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Course</div>
              <div className="text-lg font-semibold text-slate-900">{mapping.course}</div>
            </div>
            <div className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Semester</div>
              <div className="text-lg font-semibold text-slate-900">{mapping.semester}</div>
            </div>
            <div className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Section</div>
              <div className="text-lg font-semibold text-slate-900">{mapping.section}</div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Subjects</div>
                <div className="mt-1 text-sm text-slate-500">{mapping.subjects.length} subjects included</div>
              </div>
              <Badge bg="#ECFDF5" color="#166534">Read only</Badge>
            </div>

            <div className="mt-5 space-y-4">
              {mapping.subjects.map((subject) => (
                <div key={subject.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm text-slate-500">Subject</div>
                      <div className="text-lg font-semibold text-slate-900">{subject.name}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge bg="#EFF6FF" color="#1D4ED8">Seq {subject.sequence}</Badge>
                      <Badge bg="#FCE7F3" color="#9D174D">{subject.type}</Badge>
                      <Badge bg="#FEF3C7" color="#92400E">{subject.assessmentModel}</Badge>
                      <Badge bg="#ECFDF5" color="#047857">{subject.mode}</Badge>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Teacher</div>
                      <div className="mt-2 text-sm font-medium text-slate-800">{subject.teacher}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Subject code</div>
                      <div className="mt-2 text-sm font-medium text-slate-800">{subject.id}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Mapping ID</div>
            <div className="mt-2 text-sm font-medium text-slate-900">{mapping.id}</div>
          </div>
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Created</div>
            <div className="mt-2 text-sm font-medium text-slate-900">Demo data</div>
          </div>
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">View mode</div>
            <div className="mt-2 text-sm font-medium text-slate-900">Read-only details</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
