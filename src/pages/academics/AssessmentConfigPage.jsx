import { useEffect, useMemo, useState } from 'react';
import { Edit3, Eye, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import Button from '../../components/ui/Button.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';
import { collegeOptions as sharedCollegeNames } from '../../services/subjectMappingTypes.js';
import { useResourceList, useCreateResource, useUpdateResource, useDeleteResource } from '../../hooks/useResourceHooks';

const INITIAL_FORM_STATE = {
  departmentId: '',
  courseId: '',
  semesterId: '',
  sectionId: '',
  assessmentName: '',
  assessmentModel: '',
  entryType: '',
  gradeSetupId: '',
  status: 'Active',
  description: '',
  subjectRows: [],
};

const DEFAULT_SUBJECT_ROW = () => ({ id: `new-${Date.now()}-${Math.random()}`, subjectId: '', subjectName: '' });

const assessmentNameOptions = [
  { value: 'Unit Test 1', label: 'Unit Test 1' },
  { value: 'Unit Test 2', label: 'Unit Test 2' },
  { value: 'Mid Term', label: 'Mid Term' },
  { value: 'Final Exam', label: 'Final Exam' },
  { value: 'Assignment', label: 'Assignment' },
  { value: 'Project', label: 'Project' },
];

const assessmentModelOptions = [
  { value: 'SCHOLASTIC', label: 'Scholastic' },
  { value: 'CO_SCHOLASTIC', label: 'Co-scholastic' },
  { value: 'DISCIPLINE', label: 'Discipline' },
  { value: 'SKILL', label: 'Skill' },
  { value: 'MAJOR', label: 'Major' },
  { value: 'MINOR', label: 'Minor' },
  { value: 'MDC', label: 'MDC' },
  { value: 'SEC', label: 'SEC' },
  { value: 'VAC', label: 'VAC' },
  { value: 'AEC', label: 'AEC' },
  { value: 'VOC', label: 'VOC' },
  { value: 'ASSIGNMENT', label: 'Assignment' },
  { value: 'PROJECT', label: 'Project' },
];

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

const entryTypeOptions = [
  { value: 'MARKS', label: 'Marks' },
  { value: 'GRADE', label: 'Grade' },
];

export default function AssessmentConfigPage() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({ department: 'ALL', course: '', semester: '', section: '', assessment: '', lockMarksEntry: '' });
  const [formValues, setFormValues] = useState({ ...INITIAL_FORM_STATE, subjectRows: [DEFAULT_SUBJECT_ROW()] });

  const { data: configsData, isLoading: configsLoading } = useResourceList('assessmentConfigs', { page: 1, pageSize: 200 });
  const { data: departmentsData } = useResourceList('departments', { page: 1, pageSize: 200 });
  const { data: coursesData } = useResourceList('courses', { page: 1, pageSize: 200 });
  const { data: semestersData } = useResourceList('semesters', { page: 1, pageSize: 200 });
  const { data: classesData } = useResourceList('classes', { page: 1, pageSize: 200 });
  const { data: sectionsData } = useResourceList('sections', { page: 1, pageSize: 200 });
  const { data: subjectsData } = useResourceList('subjects', { page: 1, pageSize: 200 });
  const { data: gradeSetupsData } = useResourceList('assessmentGradeSetups', { page: 1, pageSize: 200 });

  const createMutation = useCreateResource('assessmentConfigs');
  const updateMutation = useUpdateResource('assessmentConfigs');
  const deleteMutation = useDeleteResource('assessmentConfigs');

  useEffect(() => {
    document.title = 'Assessment Config - Academics';
  }, []);

  const departments = departmentsData?.items || [];
  const courses = coursesData?.items || [];
  const semesters = semestersData?.items || [];
  const classes = classesData?.items || [];
  const sections = sectionsData?.items || [];
  const subjects = subjectsData?.items || [];
  const gradeSetups = gradeSetupsData?.items || [];

  const selectedDepartmentId = formValues.departmentId ? Number(formValues.departmentId) : null;
  const selectedCourseId = formValues.courseId ? Number(formValues.courseId) : null;

  const departmentOptions = useMemo(
    () => sharedCollegeNames.map((college) => ({ value: college, label: college })),
    [],
  );

  const courseOptions = useMemo(
    () => courses
      .filter((course) => !selectedDepartmentId || Number(course.department_id) === selectedDepartmentId)
      .map((course) => ({ value: String(course.id), label: `${course.name}${course.code ? ` (${course.code})` : ''}` })),
    [courses, selectedDepartmentId],
  );

  const semesterOptions = useMemo(
    () => semesters.map((semester) => ({ value: String(semester.id), label: semester.name })),
    [semesters],
  );

  const sectionOptions = useMemo(() => {
    const filteredClassIds = classes
      .filter((academicClass) => !selectedCourseId || Number(academicClass.course_id) === selectedCourseId)
      .map((academicClass) => Number(academicClass.id));
    return sections
      .filter((section) => !selectedCourseId || filteredClassIds.includes(Number(section.academic_class_id)))
      .map((section) => ({ value: String(section.id), label: section.name }));
  }, [classes, sections, selectedCourseId]);

  const subjectOptions = useMemo(
    () => subjects
      .filter((subject) => !selectedCourseId || Number(subject.course_id) === selectedCourseId)
      .map((subject) => ({ value: String(subject.id), label: subject.name })),
    [subjects, selectedCourseId],
  );

  const gradeSetupOptions = useMemo(() => {
    const apiOptions = (gradeSetups || []).map((setup) => ({ value: String(setup.id), label: setup.name }));
    const defaultGradeSetups = [
      'External exams',
      'B.TECH',
      'B.TECH. HONOURS',
      'BCA',
      'MCA',
      'BBA/B.COM/MBA EXAMS',
      'M.TECH',
      'B.SC/M.SC./AGRICULTURE',
      'B.PHARM/M.PHARM',
      'B.SC NURSING',
      'D.PHARM',
    ].map((v) => ({ value: v, label: v }));

    // Merge API options with defaults, preferring API entries when labels clash
    const merged = [...apiOptions];
    defaultGradeSetups.forEach((def) => {
      if (!merged.some((m) => String(m.label).toLowerCase() === String(def.label).toLowerCase())) merged.push(def);
    });
    return merged;
  }, [gradeSetups]);

  const tableColumns = useMemo(
    () => ['Assessment Name', 'Assessment Model', 'Scope', 'Subjects', 'Grade Setup', 'Status', 'Actions'],
    [],
  );

  const openCreate = () => {
    setEditItem(null);
    setFormValues({ ...INITIAL_FORM_STATE, subjectRows: [DEFAULT_SUBJECT_ROW()] });
    setShowModal(true);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => setFilters({ department: 'ALL', course: '', semester: '', section: '', assessment: '', lockMarksEntry: '' });

  const applyFilters = () => {
    setShowFilterModal(false);
  };

  const openEdit = (item) => {
    const [departmentName, courseName, semesterName, sectionName] = (item.key || '').split(' / ');
    const department = departments.find((dept) => dept.name === departmentName);
    const course = courses.find((courseItem) => courseItem.name === courseName);
    const semester = semesters.find((semesterItem) => semesterItem.name === semesterName);
    const section = sections.find((sectionItem) => sectionItem.name === sectionName);

    const parsedSubjects = (item.value || '').split(',').map((subjectText) => {
      const trimmed = subjectText.trim();
      const found = subjects.find((subject) => subject.name === trimmed);
      return {
        id: `edit-${trimmed}-${Math.random()}`,
        subjectId: found ? String(found.id) : '',
        subjectName: trimmed,
      };
    }).filter((row) => row.subjectName);

    setEditItem(item);
    setFormValues({
      departmentId: department ? String(department.id) : '',
      courseId: course ? String(course.id) : '',
      semesterId: semester ? String(semester.id) : '',
      sectionId: section ? String(section.id) : '',
      assessmentName: item.name || '',
      assessmentModel: item.assessment_type || '',
      entryType: item.entry_type || '',
      gradeSetupId: gradeSetups.find((setup) => String(setup.id) === String(item.code)) ? String(item.code) : '',
      status: item.status || 'Active',
      description: item.description || '',
      subjectRows: parsedSubjects.length ? parsedSubjects : [DEFAULT_SUBJECT_ROW()],
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditItem(null);
    setFormValues({ ...INITIAL_FORM_STATE, subjectRows: [DEFAULT_SUBJECT_ROW()] });
  };

  const handleFormChange = (field, value) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubjectChange = (rowId, field, value) => {
    setFormValues((current) => ({
      ...current,
      subjectRows: current.subjectRows.map((row) => {
        if (row.id !== rowId) return row;
        if (field === 'subjectId') {
          const subject = subjects.find((item) => String(item.id) === String(value));
          return {
            ...row,
            subjectId: value,
            subjectName: subject?.name || row.subjectName,
          };
        }
        return { ...row, [field]: value };
      }),
    }));
  };

  const addSubjectRow = () => {
    setFormValues((current) => ({
      ...current,
      subjectRows: [...current.subjectRows, DEFAULT_SUBJECT_ROW()],
    }));
  };

  const removeSubjectRow = (rowId) => {
    setFormValues((current) => ({
      ...current,
      subjectRows: current.subjectRows.filter((row) => row.id !== rowId),
    }));
  };

  const buildPayload = () => {
    const department = departments.find((item) => String(item.id) === String(formValues.departmentId));
    const course = courses.find((item) => String(item.id) === String(formValues.courseId));
    const semester = semesters.find((item) => String(item.id) === String(formValues.semesterId));
    const section = sections.find((item) => String(item.id) === String(formValues.sectionId));
    const gradeSetup = gradeSetups.find((item) => String(item.id) === String(formValues.gradeSetupId));

    return {
      name: formValues.assessmentName || 'Untitled assessment',
      code: gradeSetup?.name || formValues.assessmentModel || '',
      assessment_type: formValues.assessmentModel || 'General',
      entry_type: formValues.entryType || '',
      key: [department?.name, course?.name, semester?.name, section?.name].filter(Boolean).join(' / '),
      value: formValues.subjectRows
        .map((row) => row.subjectName || '')
        .filter(Boolean)
        .join(', '),
      status: formValues.status,
      description: formValues.description || gradeSetup?.description || '',
    };
  };

  const handleModalSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = buildPayload();
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, payload });
        toast.success('Assessment config updated');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Assessment config created');
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error?.message || 'Could not save assessment config');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this assessment config?')) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('Assessment config deleted');
    } catch (error) {
      toast.error(error?.message || 'Could not delete assessment config');
    }
  };

  const tableRows = useMemo(() => {
    const records = configsData?.items || [];
    // Apply simple client-side filters based on selected filter form
    const filtered = records.filter((item) => {
      if (filters.department && filters.department !== 'ALL') {
        const deptName = (item.key || '').split(' / ')[0];
        if (!deptName || String(deptName) !== String(filters.department)) return false;
      }
      if (filters.course) {
        const courseName = (item.key || '').split(' / ')[1];
        if (!courseName || String(courseName) !== String(filters.course)) return false;
      }
      if (filters.semester) {
        const semName = (item.key || '').split(' / ')[2];
        if (!semName || String(semName) !== String(filters.semester)) return false;
      }
      if (filters.section) {
        const secName = (item.key || '').split(' / ')[3];
        if (!secName || String(secName) !== String(filters.section)) return false;
      }
      if (filters.assessment) {
        if (!item.name || String(item.name) !== String(filters.assessment)) return false;
      }
      // lockMarksEntry filtering requires backend field; check if present
      if (filters.lockMarksEntry) {
        if (typeof item.lock_marks_entry !== 'undefined' && String(item.lock_marks_entry) !== String(filters.lockMarksEntry)) return false;
      }
      return true;
    });

    return filtered.map((item) => {
      const scopeValue = item.key || '—';
      const subjectsValue = item.value || '—';
      const gradeSetupRecord = gradeSetups.find((setup) => String(setup.id) === String(item.code)) || gradeSetups.find((setup) => setup.name === item.code);
      const gradeSetupLabel = gradeSetupRecord?.name || item.code || '—';

      return [
        item.name || '—',
        item.assessment_type || '—',
        scopeValue,
        subjectsValue,
        gradeSetupLabel,
        item.status || '—',
        <div key={`actions-${item.id}`} className="flex flex-wrap items-center justify-center gap-1.5">
          <button
            type="button"
            title="View"
            aria-label="View"
            onClick={() => openEdit(item)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100 hover-gradient-border"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Edit"
            aria-label="Edit"
            onClick={() => openEdit(item)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 hover-gradient-border"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Delete"
            aria-label="Delete"
            onClick={() => handleDelete(item)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 hover-gradient-border"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>,
      ];
    });
    // Dependencies intentionally include gradeSetups so the table updates when the lookup list is available.
  }, [configsData?.items, gradeSetups, departments, courses, semesters, sections, subjects]);

  const tableDataRows = tableRows;

  return (
    <div className="min-h-screen w-full min-w-0 px-[12px] pb-8 pt-4 lg:px-6">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Institute Setup', to: '/settings/institute' },
            { label: 'Academics', to: '/settings/institute/academics' },
            { label: 'Assessment Config' },
          ]}
        />
        <div className="mt-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Assessment Config</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Manage academic assessment settings for institution configuration and subject assignment workflows.</p>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Assessment configurations</h2>
            <p className="text-sm text-slate-500">Use the table below to review existing configs and add new assessment settings.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" onClick={() => setShowFilterModal(true)} className="inline-flex items-center gap-2 px-4 py-3 text-sm" variant="secondary">
              Filter
            </Button>
            <Button type="button" onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-3 text-sm" variant="primary">
              <Plus className="h-4 w-4" /> Add assessment config
            </Button>
          </div>
        </div>

        <DataTable
          columns={tableColumns}
          rows={tableDataRows}
          loading={configsLoading}
          placeholder="Search assessment config records..."
        />
      </div>

      <Modal
        title={editItem ? 'Edit assessment config' : 'Add assessment config'}
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        footer={
          <>
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm(); }}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button type="submit" form="assessment-config-form" className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover-gradient-border">
              Save assessment config
            </button>
          </>
        }
      >
        <form id="assessment-config-form" onSubmit={handleModalSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">College</label>
              <SearchableSelect
                options={departmentOptions}
                value={formValues.departmentId}
                onChange={(value) => handleFormChange('departmentId', value)}
                placeholder="Select college"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Course</label>
              <SearchableSelect
                options={courseOptions}
                value={formValues.courseId}
                onChange={(value) => handleFormChange('courseId', value)}
                placeholder="Select course"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Semester</label>
              <SearchableSelect
                options={semesterOptions}
                value={formValues.semesterId}
                onChange={(value) => handleFormChange('semesterId', value)}
                placeholder="Select semester"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Section</label>
              <SearchableSelect
                options={sectionOptions}
                value={formValues.sectionId}
                onChange={(value) => handleFormChange('sectionId', value)}
                placeholder="Select section"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Assessment name</label>
              <SearchableSelect
                options={assessmentNameOptions}
                value={formValues.assessmentName}
                onChange={(value) => handleFormChange('assessmentName', value)}
                placeholder="Select assessment name"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Assessment model</label>
              <SearchableSelect
                options={assessmentModelOptions}
                value={formValues.assessmentModel}
                onChange={(value) => handleFormChange('assessmentModel', value)}
                placeholder="Select assessment model"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Grade setup</label>
              <SearchableSelect
                options={gradeSetupOptions}
                value={formValues.gradeSetupId}
                onChange={(value) => handleFormChange('gradeSetupId', value)}
                placeholder="Select grade setup"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Entry Type</label>
              <SearchableSelect
                options={entryTypeOptions}
                value={formValues.entryType}
                onChange={(value) => handleFormChange('entryType', value)}
                placeholder="Select entry type"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
              <SearchableSelect
                options={statusOptions}
                value={formValues.status}
                onChange={(value) => handleFormChange('status', value)}
                placeholder="Select status"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                rows={3}
                value={formValues.description}
                onChange={(event) => handleFormChange('description', event.target.value)}
                placeholder="Optional description"
                className="w-full rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none hover-gradient-border"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Subject rows</h3>
                <p className="text-xs text-slate-500">Select subjects for this assessment configuration. Subjects are filtered by the selected course.</p>
              </div>
              <button type="button" onClick={addSubjectRow} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 hover-gradient-border">
                <Plus className="h-4 w-4" /> Add subject
              </button>
            </div>

            <div className="space-y-3">
              {formValues.subjectRows.map((row) => (
                <div key={row.id} className="grid gap-3 md:grid-cols-[1.6fr_1fr_auto] items-end rounded-2xl border border-slate-200 bg-white p-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Subject</label>
                    <SearchableSelect
                      options={subjectOptions}
                      value={row.subjectId}
                      onChange={(value) => handleSubjectChange(row.id, 'subjectId', value)}
                      placeholder="Choose subject"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Subject label</label>
                    <input
                      type="text"
                      value={row.subjectName}
                      onChange={(event) => handleSubjectChange(row.id, 'subjectName', event.target.value)}
                      placeholder="Custom label"
                      className="w-full rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none hover-gradient-border"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSubjectRow(row.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 hover-gradient-border"
                    title="Remove subject"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        title="Filter"
        isOpen={showFilterModal}
        onClose={() => { setShowFilterModal(false); }}
        footer={
          <>
            <button
              type="button"
              onClick={() => { resetFilters(); setShowFilterModal(false); }}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button type="button" onClick={applyFilters} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover-gradient-border">
              Go
            </button>
          </>
        }
      >
        <form id="assessment-filter-form" onSubmit={(e) => { e.preventDefault(); applyFilters(); }} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Select College</label>
              <SearchableSelect
                options={[{ value: 'ALL', label: 'ALL, ROORKEE COLLEGE ...' }, ...departmentOptions]}
                value={filters.department}
                onChange={(value) => handleFilterChange('department', value)}
                placeholder="Select college"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Select Course</label>
              <SearchableSelect
                options={courseOptions}
                value={filters.course}
                onChange={(value) => handleFilterChange('course', value)}
                placeholder="Select course"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Select Semester</label>
              <SearchableSelect
                options={semesterOptions}
                value={filters.semester}
                onChange={(value) => handleFilterChange('semester', value)}
                placeholder="Select semester"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Select Section</label>
              <SearchableSelect
                options={sectionOptions}
                value={filters.section}
                onChange={(value) => handleFilterChange('section', value)}
                placeholder="Select section"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Select Assessment</label>
              <SearchableSelect
                options={assessmentNameOptions}
                value={filters.assessment}
                onChange={(value) => handleFilterChange('assessment', value)}
                placeholder="Select assessment"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Lock Marks Entry</label>
              <SearchableSelect
                options={[{ value: '', label: 'Any' }, { value: 'LOCKED', label: 'Locked' }, { value: 'OPEN', label: 'Open' }]}
                value={filters.lockMarksEntry}
                onChange={(value) => handleFilterChange('lockMarksEntry', value)}
                placeholder="Lock Marks Entry"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
