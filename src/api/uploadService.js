import api from './axios';
import { getEndpoint } from './endpoints';

const createStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
};

const getUploadKey = (resource) => `erp:uploads:${resource}`;

const readUploads = (resource) => {
  const storage = createStorage();
  const raw = storage.getItem(getUploadKey(resource));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeUploads = (resource, uploads) => {
  const storage = createStorage();
  storage.setItem(getUploadKey(resource), JSON.stringify(uploads));
};

const uploadService = {
  upload: async (resource, formData) => {
    const endpoint = getEndpoint(resource);
    try {
      const res = await api.post(`/${endpoint}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch {
      const file = formData.get?.('file');
      const studentId = formData.get?.('studentId');
      const documentType = formData.get?.('documentType');
      const payload = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        resource,
        studentId: studentId || null,
        documentType: documentType || null,
        filename: file?.name || 'upload',
        size: file?.size || 0,
        uploadedAt: new Date().toISOString(),
      };
      const uploads = readUploads(resource);
      writeUploads(resource, [...uploads, payload]);
      return payload;
    }
  },
  download: async (resource, params = {}) => {
    const endpoint = getEndpoint(resource);
    try {
      const res = await api.get(`/${endpoint}/download`, { params, responseType: 'blob' });
      return res.data;
    } catch {
      const items = readUploads(resource);
      const csvRows = [
        ['id', 'resource', 'studentId', 'documentType', 'filename', 'size', 'uploadedAt'],
        ...items.map((item) => [item.id, item.resource, item.studentId || '', item.documentType || '', item.filename || '', item.size || '', item.uploadedAt || '']),
      ];
      const csvContent = csvRows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    }
  }
};

export default uploadService;
