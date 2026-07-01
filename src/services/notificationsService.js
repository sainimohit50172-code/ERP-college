const NOTIFICATIONS_KEY = 'erp_notifications';

function loadNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn('Failed to load notifications from localStorage');
    return [];
  }
}

function saveNotifications(list) {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list.slice(0, 200)));
  } catch (e) { console.warn('Failed to save notifications', e); }
}

let subscribers = new Set();

export function getNotifications() {
  return loadNotifications();
}

export function addNotification({ title, details = '', type = 'info', date = null, meta = {} }) {
  const n = { id: `NOTIF-${Date.now()}-${Math.random().toString(16).slice(2)}`, title, details, type, date: date || new Date().toISOString().split('T')[0], meta, read: false };
  const list = loadNotifications();
  list.unshift(n);
  saveNotifications(list);
  subscribers.forEach((cb) => {
    try { cb(list); } catch (e) { console.warn('Notification subscriber error', e); }
  });
  return n;
}

export function subscribe(fn) {
  if (typeof fn === 'function') subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export default {
  getNotifications,
  addNotification,
  subscribe,
};
