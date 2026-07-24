import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { RefreshCw, Plus } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';
import SubjectBlock from './SubjectBlock.jsx';
import TeacherSelect from './TeacherSelect.jsx';
import {
  collegeSelectOptions,
  courseSelectOptions,
  semesterSelectOptions,
  sectionSelectOptions,
  coordinatorSelectOptions,
  teacherSelectOptions,
  subjectSelectOptions,
  assessmentModelOptions,
  subjectModeOptions,
  subjectTypeOptions,
} from '../../services/subjectMappingTypes.js';
import { getMapping } from '../../services/subjectMappingService.js';

const newSubjectTemplate = {
  id: `new-${Date.now()}`,
  subject: '',
  assessmentModel: 'MAJOR',
  mode: 'theory',
  type: 'GENERAL',
  teacher: '',
  sequence: 1,
  count: 1,
  displayName: '',
  visible: true,
};

export default function EditSubjectCollegeMappingPage() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const mode = location.pathname.includes('/view/') ? 'view' : 'edit';
  const [mapping, setMapping] = useState(null);
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const demo = getMapping(params.id);
    if (!demo) {
      navigate('/settings/institute/academics/subject-college-mapping', { replace: true });
      return;
    }
    setMapping(demo);
  }, [params.id, navigate]);

  const filteredSubjects = useMemo(() => {
    if (!mapping) return [];
    const query = search.trim().toLowerCase();
    if (!query) return mapping.subjects;
    return mapping.subjects.filter((subject) =>
      subject.subject.toLowerCase().includes(query)
      || subject.displayName.toLowerCase().includes(query)
      || subject.teacher.toLowerCase().includes(query),
    );
  }, [mapping, search]);

  const handleFieldChange = (field, value) => {
    setMapping((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSubjectChange = (index, field, value) => {
    setMapping((prev) => {
      if (!prev) return prev;
      const subjects = prev.subjects.map((item, idx) => idx === index ? { ...item, [field]: value } : item);
      return { ...prev, subjects };
    });
  };

  const handleAddSubject = () => {
    setMapping((prev) => {
      if (!prev) return prev;
      const nextSequence = prev.subjects.length + 1;
      return { ...prev, subjects: [...prev.subjects, { ...newSubjectTemplate, id: `${prev.id}-new-${nextSequence}`, sequence: nextSequence }] };
    });
  };

  const handleDeleteSubject = (index) => {
    if (!window.confirm('Delete this subject?')) return;
    setMapping((prev) => {
      if (!prev) return prev;
      const subjects = prev.subjects.filter((_, idx) => idx !== index);
      return { ...prev, subjects };
    });
  };

  const handleRefresh = () => {
    const demo = getMapping(params.id);
    if (demo) {
      setMapping(demo);
      setErrors({});
      setSearch('');
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!mapping) return nextErrors;
    if (!mapping.college) nextErrors.college = 'College is required';
    if (!mapping.course) nextErrors.course = 'Course is required';
    if (!mapping.semester) nextErrors.semester = 'Semester is required';
    if (!mapping.section) nextErrors.section = 'Section is required';
    mapping.subjects.forEach((subject, idx) => {
      if (!subject.subject) nextErrors[`subject-${idx}`] = 'Subject is required';
      if (!subject.teacher) nextErrors[`teacher-${idx}`] = 'Teacher is required';
      if (!Number.isFinite(subject.sequence) || subject.sequence < 1) nextErrors[`sequence-${idx}`] = 'Sequence must be numeric and positive';
      if (!Number.isFinite(subject.count) || subject.count < 1) nextErrors[`count-${idx}`] = 'Count must be numeric and positive';
    });
    return nextErrors;
  };

  const saveMapping = (assign = false) => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    const actionText = assign ? 'Saved and assigned successfully.' : 'Saved successfully.';
    window.alert(actionText);
  };

  if (!mapping) {
    return null;
  }

  return (
    <div className="min-h-screen w-full min-w-0 px-4 pb-8 pt-4 lg:px-6">
      <div className="flex flex-col gap-3 pb-4">
        <div className="flex items-center gap-3">
          <nav className="text-sm text-slate-400">Dashboard &gt; Institute Setup &gt; Academics &gt; Subject College Mapping &gt; Edit Subject College Mapping</nav>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[40px] font-medium text-slate-900">Edit Subject College Mapping</h1>
            <div className="text-[13px] text-slate-500">Edit Subject College Mapping</div>
          </div>
          <div>
            <Link to="/settings/institute/academics/subject-college-mapping">
              <Button variant="success" className="min-w-[190px] h-[40px] text-[13px] rounded-[10px]">Go Back</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm shadow-slate-100/40">
        <div className="grid gap-3 xl:grid-cols-5">
          <div>
            <div className="text-[12px] font-medium text-slate-500 mb-1">College</div>
            <SearchableSelect
              options={collegeSelectOptions}
              value={mapping.college}
              onChange={(value) => handleFieldChange('college', value)}
              placeholder="Select college"
            />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Select Course</div>
            <SearchableSelect
              options={courseSelectOptions}
              value={mapping.course}
              onChange={(value) => handleFieldChange('course', value)}
              placeholder="Select course"
            />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Semester</div>
            <SearchableSelect
              options={semesterSelectOptions}
              value={mapping.semester}
              onChange={(value) => handleFieldChange('semester', value)}
              placeholder="Select semester"
            />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Select Section</div>
            <SearchableSelect
              options={sectionSelectOptions}
              value={mapping.section}
              onChange={(value) => handleFieldChange('section', value)}
              placeholder="Select section"
            />
          </div>
          <div>
            <div className="text-[12px] font-medium text-slate-500 mb-1">Search Subject</div>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search Subject"
              className="h-[40px] w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-[1.2fr_1fr_1.2fr_0.8fr]">
          <div>
            <div className="text-[12px] font-medium text-slate-500 mb-1">College Teacher</div>
            <TeacherSelect
              options={teacherSelectOptions}
              value={mapping.collegeTeacher}
              onChange={(value) => handleFieldChange('collegeTeacher', value)}
            />
          </div>
          <div>
            <div className="text-[12px] font-medium text-slate-500 mb-1">Select Coordinator</div>
            <TeacherSelect
              options={coordinatorSelectOptions}
              value={mapping.coordinator}
              onChange={(value) => handleFieldChange('coordinator', value)}
            />
          </div>
          <div>
            <div className="text-[12px] font-medium text-slate-500 mb-1">Search Subject</div>
            <div className="flex items-center rounded-md border border-slate-200 bg-white px-3">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search Subject"
                className="w-full border-none bg-transparent p-2 text-[13px] text-slate-900 outline-none"
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={handleRefresh} className="w-full h-[40px] text-[13px] rounded-[10px]">
              <RefreshCw className="h-4 w-4 mr-2" />Refresh
            </Button>
          </div>
        </div>
      </div>

      {errors.general ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errors.general}
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {filteredSubjects.map((subject, index) => (
          <SubjectBlock
            key={subject.id}
            block={subject}
            subjectOptions={subjectSelectOptions}
            assessmentOptions={assessmentModelOptions}
            modeOptions={subjectModeOptions}
            typeOptions={subjectTypeOptions}
            teacherOptions={teacherSelectOptions}
            onChange={(field, value) => handleSubjectChange(index, field, value)}
            onDelete={() => handleDeleteSubject(index)}
            disabled={mode === 'view'}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="success" onClick={handleAddSubject} className="inline-flex items-center gap-2 h-[40px] rounded-[10px] text-[13px]">
          <Plus className="h-4 w-4" />Add Subject Details
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => saveMapping(false)} className="h-[40px] text-[13px] rounded-[10px]">Edit</Button>
          <Button variant="secondary" onClick={() => saveMapping(true)} className="h-[40px] text-[13px] rounded-[10px]">Edit and Assign</Button>
        </div>
      </div>
    </div>
  );
}
