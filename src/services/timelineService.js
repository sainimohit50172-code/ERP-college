const TIMELINE_STORAGE_KEY = 'studentTimelineEvents';

const readTimelineEvents = () => {
  const raw = localStorage.getItem(TIMELINE_STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
};

const writeTimelineEvents = (payload) => {
  localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(payload));
};

export function getTimeline(studentId) {
  const all = readTimelineEvents();
  return all[studentId] || [];
}

export function addTimelineEvent(studentId, event) {
  const all = readTimelineEvents();
  const existing = all[studentId] || [];
  const nextEvents = [
    ...existing,
    {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: event.title,
      description: event.description || '',
      category: event.category || 'Update',
      timestamp: new Date().toISOString(),
    },
  ];
  writeTimelineEvents({ ...all, [studentId]: nextEvents });
  return nextEvents;
}
