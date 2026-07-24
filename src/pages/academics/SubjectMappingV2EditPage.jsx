import { Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Plus, X, Eye, Edit2, Trash2 } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';
import { getMapping } from '../../services/subjectMappingV2Service.js';

const subjectOptions = [
  'Operating Systems',
  'Database Management System',
  'Fundamentals of AI and ML',
  'Object Oriented Programming',
  'Data Structures',
  'Algorithms',
  'Computer Networks',
  'Software Engineering',
  'Web Technologies',
];

const typeOptions = ['GENERAL', 'LAB', 'PROJECT', 'PRACTICAL'];
const modelOptions = ['SCHOLASTIC', 'CO-SCHOLASTIC', 'DISCIPLINE', 'SKILL', 'MAJOR', 'MINOR', 'MDC', 'SEC', 'VAC', 'AEC', 'VOC'];
const teacherOptions = [
  'Dr. Asha Verma (HU151)',
  'Dr. R. Kumar (HU153)',
  'Mr. Vinay Pant (HU154)',
  'Akanksha Shukla (HU155)',
  'Pooja Malhotra (HU153)',
  'Rohit Kumar (HU154)',
  'Abhishek Parmar (HU150)',
  'Nisha Sharma (HU157)',
  'Ritika Singh (HU158)',
  'Neha Gupta (HU159)',
  'Aman Joshi (HU160)',
];

const chipStyles = {
  college: 'bg-sky-100 text-sky-800',
  course: 'bg-violet-100 text-violet-800',
  semester: 'bg-slate-700 text-white',
  section: 'bg-emerald-100 text-emerald-800',
};

const createSubject = (sequence) => ({
  id: `new-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  code: `SUBJ${Math.floor(Math.random() * 900) + 100}`,
  name: '',
  type: 'GENERAL',
  model: 'SCHOLASTIC',
  displayName: '',
  teacher: '',
  sequence,
});

function mapOptions(list) {
  return list.map((value) => ({ label: value, value }));
}

function Badge({ children, className = '' }) {
  return (
    <div className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold ${className}`}>{children}</div>
  );
}

export default function SubjectMappingV2EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mapping, setMapping] = useState(null);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const demo = getMapping(id);
    if (!demo) {
      navigate('/settings/institute/academics/subject-college-mapping-v2', { replace: true });
      return;
    }
    setMapping(demo);
    setGroups([{ id: `group-${Date.now()}`, title: 'Subject Group 1', subjects: demo.subjects.map((subject, index) => ({ ...subject, sequence: index + 1 })) }]);
  }, [id, navigate]);

  const teacherList = useMemo(() => {
    const subjectTeachers = mapping?.subjects.map((subject) => subject.teacher).filter(Boolean) || [];
    const unique = Array.from(new Set([...subjectTeachers, ...teacherOptions]));
    return unique.map((teacher) => ({ label: teacher, value: teacher }));
  }, [mapping]);

  const handleRemoveTeacher = (groupId, subjectId) => {
    updateSubject(groupId, subjectId, 'teachers', []);
  };

  const handleAddTeacher = (groupId, subjectId, teacher) => {
    updateSubject(groupId, subjectId, 'teacher', teacher);
  };

  const errors = useMemo(() => {
    const next = {};
    groups.forEach((group) => {
      group.subjects.forEach((subject) => {
        if (!subject.name) next[`${group.id}-${subject.id}-name`] = 'Subject required';
        if (!subject.type) next[`${group.id}-${subject.id}-type`] = 'Type required';
        if (!subject.model) next[`${group.id}-${subject.id}-model`] = 'Model required';
        if (!subject.displayName) next[`${group.id}-${subject.id}-displayName`] = 'Display Name required';
        if (!subject.teacher) next[`${group.id}-${subject.id}-teacher`] = 'Teacher required';
      });
    });
    return next;
  }, [groups]);

  const setGroupData = (updater) => setGroups((current) => {
    const next = updater(current);
    return next.map((group) => ({
      ...group,
      subjects: group.subjects.map((subject, index) => ({ ...subject, sequence: index + 1 })),
    })).filter((group) => group.subjects.length > 0);
  });

  const addSubjectGroup = () => {
    setGroups((current) => [
      ...current,
      {
        id: `group-${Date.now()}`,
        title: `Subject Group ${current.length + 1}`,
        subjects: [createSubject(1)],
      },
    ]);
  };

  const addSubject = () => {
    setGroups((current) => {
      if (current.length === 0) {
        return [{ id: `group-${Date.now()}`, title: 'Subject Group 1', subjects: [createSubject(1)] }];
      }
      return current.map((group, index) => {
        if (index !== current.length - 1) return group;
        return {
          ...group,
          subjects: [...group.subjects, createSubject(group.subjects.length + 1)],
        };
      });
    });
  };

  const updateSubject = (groupId, subjectId, field, value) => {
    setGroupData((current) => current.map((group) => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        subjects: group.subjects.map((subject) => {
          if (subject.id !== subjectId) return subject;
          const next = { ...subject, [field]: value };
          if (field === 'name' && !next.displayName) {
            next.displayName = value;
          }
          return next;
        }),
      };
    }));
  };

  const removeSubject = (groupId, subjectId) => {
    if (!window.confirm('Delete this subject row?')) return;
    setGroupData((current) => current.map((group) => {
      if (group.id !== groupId) return group;
      return { ...group, subjects: group.subjects.filter((subject) => subject.id !== subjectId) };
    }));
  };

  if (!mapping) {
    return null;
  }

  return (
    <div className="min-h-screen w-full min-w-0 px-[10px] pb-8 pt-4 lg:px-6">
      <div className="flex flex-col gap-4 pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/settings/institute/academics/subject-college-mapping-v2')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                aria-label="Back to Subject Mapping V2"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <Breadcrumb
                items={[
                  { label: 'Dashboard', to: '/' },
                  { label: 'Institute Setup', to: '/settings/institute' },
                  { label: 'Academics', to: '/settings/institute/academics' },
                  { label: 'Subject Mapping V2', to: '/settings/institute/academics/subject-college-mapping-v2' },
                  { label: 'Edit Subject Mapping' },
                ]}
              />
            </div>
            <div>
              <h1 className="text-[30px] font-semibold text-slate-900">Subject Mapping V2</h1>
              <p className="mt-1 text-[13px] text-slate-500">Edit Subject Mapping</p>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Selection Path</div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className={chipStyles.college}>{mapping.college}</Badge>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <Badge className={chipStyles.course}>{mapping.course}</Badge>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <Badge className={chipStyles.semester}>{mapping.semester}</Badge>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <Badge className={chipStyles.section}>{mapping.section}</Badge>
          </div>
        </div>
      </div>

      <div className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Configure Subject Details</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={addSubjectGroup} className="inline-flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition">
              <Plus className="h-4 w-4" /> Add Subject Group
            </button>
            <button type="button" onClick={addSubject} className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition">
              <Plus className="h-4 w-4" /> Add Subject
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto border border-slate-200 rounded-md">
          <div className="inline-block min-w-full bg-white">
            {/* Header Row */}
            <div className="grid gap-0 bg-emerald-600 text-white h-12 items-center"
              style={{ gridTemplateColumns: '50px 90px 220px 150px 170px 240px 200px 60px' }}>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center">Seq</div>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center border-l border-emerald-500">Code</div>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-l border-emerald-500">Subject</div>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-l border-emerald-500">Type</div>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-l border-emerald-500">Model</div>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-l border-emerald-500">Display Name</div>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-l border-emerald-500">Teachers</div>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-l border-emerald-500 text-center">Action</div>
            </div>

            {/* Data Rows */}
            {groups.map((group) => (
              <Fragment key={group.id}>
                {/* Group Header */}
                <div className="grid gap-0 bg-slate-100 h-10 items-center px-4 py-2 text-sm font-semibold text-slate-700 border-t border-slate-200"
                  style={{ gridTemplateColumns: '50px 90px 220px 150px 170px 240px 200px 60px' }}>
                  {group.title}
                </div>

                {/* Subject Rows */}
                {group.subjects.map((subject) => {
                  const subjectKey = `${group.id}-${subject.id}`;
                  return (
                    <div key={subject.id} className="grid gap-0 border-t border-slate-200 bg-white"
                      style={{
                        gridTemplateColumns: '50px 90px 220px 150px 170px 240px 200px 60px',
                        minHeight: '96px',
                      }}>
                      
                      {/* SEQ */}
                      <div className="px-4 py-3 flex items-center justify-center border-r border-slate-100">
                        <input
                          readOnly
                          value={subject.sequence}
                          className="h-10 w-12 rounded-md border border-slate-200 bg-slate-50 px-2 text-center text-sm font-semibold text-slate-700"
                        />
                      </div>

                      {/* SUBJECT CODE */}
                      <div className="px-4 py-3 flex items-center justify-center border-r border-slate-100">
                        <div className="text-sm font-semibold text-sky-700">{subject.code}</div>
                      </div>

                      {/* SUBJECT NAME */}
                      <div className="px-4 py-3 flex items-start border-r border-slate-100 relative">
                        <div className="w-full">
                          <SearchableSelect
                            options={mapOptions(subjectOptions)}
                            value={subject.name}
                            onChange={(value) => updateSubject(group.id, subject.id, 'name', value)}
                            placeholder="Select subject"
                          />
                          {errors[`${subjectKey}-name`] && (
                            <div className="text-xs text-rose-500 mt-1 absolute top-full left-4 right-4 bg-white pt-1 pointer-events-none hidden">
                              {errors[`${subjectKey}-name`]}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* TYPE */}
                      <div className="px-4 py-3 flex items-start border-r border-slate-100 relative">
                        <div className="w-full">
                          <SearchableSelect
                            options={mapOptions(typeOptions)}
                            value={subject.type}
                            onChange={(value) => updateSubject(group.id, subject.id, 'type', value)}
                            placeholder="Select type"
                          />
                          {errors[`${subjectKey}-type`] && (
                            <div className="text-xs text-rose-500 mt-1 absolute top-full left-4 right-4 bg-white pt-1 pointer-events-none hidden">
                              {errors[`${subjectKey}-type`]}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* MODEL */}
                      <div className="px-4 py-3 flex items-start border-r border-slate-100 relative">
                        <div className="w-full">
                          <SearchableSelect
                            options={mapOptions(modelOptions)}
                            value={subject.model}
                            onChange={(value) => updateSubject(group.id, subject.id, 'model', value)}
                            placeholder="Select model"
                          />
                          {errors[`${subjectKey}-model`] && (
                            <div className="text-xs text-rose-500 mt-1 absolute top-full left-4 right-4 bg-white pt-1 pointer-events-none hidden">
                              {errors[`${subjectKey}-model`]}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* DISPLAY NAME */}
                      <div className="px-4 py-3 flex items-start border-r border-slate-100 relative">
                        <div className="w-full">
                          <input
                            value={subject.displayName}
                            onChange={(event) => updateSubject(group.id, subject.id, 'displayName', event.target.value)}
                            placeholder="Display name"
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          />
                          {errors[`${subjectKey}-displayName`] && (
                            <div className="text-xs text-rose-500 mt-1 absolute top-full left-4 right-4 bg-white pt-1 pointer-events-none hidden">
                              {errors[`${subjectKey}-displayName`]}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* TEACHERS */}
                      <div className="px-4 py-3 flex items-start border-r border-slate-100 relative">
                        <div className="w-full relative">
                          <SearchableSelect
                            options={teacherList}
                            value={subject.teacher}
                            onChange={(value) => handleAddTeacher(group.id, subject.id, value)}
                            placeholder="Add teacher..."
                          />
                          {subject.teacher && (
                            <div className="absolute inset-0 top-1.5 left-2 flex items-center z-10 pointer-events-none">
                              <div className="inline-flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <span className="text-xs font-medium text-emerald-900 truncate max-w-[120px]">{subject.teacher}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTeacher(group.id, subject.id)}
                                  className="inline-flex items-center text-emerald-600 hover:text-emerald-800 flex-shrink-0 cursor-pointer pointer-events-auto"
                                  style={{ pointerEvents: 'auto' }}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        {errors[`${subjectKey}-teacher`] && (
                          <div className="text-xs text-rose-500 mt-1 absolute top-full left-4 right-4 bg-white pt-1 pointer-events-none hidden">
                            {errors[`${subjectKey}-teacher`]}
                          </div>
                        )}
                      </div>

                      {/* ACTION */}
                      <div className="px-4 py-3 flex items-center justify-center gap-3">
                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() => navigate(`/settings/institute/academics/subject-college-mapping-v2/view/${id}`)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
                          aria-label="View subject"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => navigate(`/settings/institute/academics/subject-college-mapping-v2/edit/${id}`)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600"
                          aria-label="Edit subject"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeSubject(group.id, subject.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete subject"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/settings/institute/academics/subject-college-mapping-v2')}
            className="rounded-md border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => alert('Edit and Assign functionality coming soon')}
            className="rounded-md border border-emerald-600 bg-white px-6 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition"
          >
            Edit and Assign
          </button>
          <button
            type="button"
            onClick={() => alert('Update Mapping - Changes saved!')}
            className="rounded-md bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            Update Mapping
          </button>
        </div>
      </div>
    </div>
  );
}
