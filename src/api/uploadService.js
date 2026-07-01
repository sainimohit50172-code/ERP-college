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
      const employeeId = formData.get?.('employeeId');
      const teacherId = formData.get?.('teacherId');
      const documentType = formData.get?.('documentType');
      const uploadedBy = formData.get?.('uploadedBy');
      const verificationStatus = formData.get?.('verificationStatus');
      const payload = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        resource,
        studentId: studentId || null,
        employeeId: employeeId || null,
        teacherId: teacherId || null,
        documentType: documentType || null,
        filename: file?.name || 'upload',
        size: file?.size || 0,
        uploadedAt: new Date().toISOString(),
        uploadedBy: uploadedBy || 'System',
        verificationStatus: verificationStatus || 'Pending',
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
        ['id', 'resource', 'studentId', 'documentType', 'filename', 'size', 'uploadedAt', 'uploadedBy', 'verificationStatus'],
        ...items.map((item) => [item.id, item.resource, item.studentId || '', item.documentType || '', item.filename || '', item.size || '', item.uploadedAt || '', item.uploadedBy || '', item.verificationStatus || 'Pending']),
      ];
      const csvContent = csvRows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    }
  },
  downloadUpload: async (resource, uploadId) => {
    const uploads = readUploads(resource);
    const upload = uploads.find((item) => item.id === uploadId);
    if (!upload) throw new Error('Upload not found');
    const content = `Document: ${upload.filename}\nType: ${upload.documentType}\nStudent ID: ${upload.studentId}\nUploaded at: ${upload.uploadedAt}\nUploaded by: ${upload.uploadedBy}\nStatus: ${upload.verificationStatus}`;
    return new Blob([content], { type: 'text/plain;charset=utf-8;' });
  },
  deleteUpload: (resource, uploadId) => {
    const uploads = readUploads(resource);
    const filtered = uploads.filter((item) => item.id !== uploadId);
    writeUploads(resource, filtered);
    return filtered;
  },
  getUploads: (resource) => readUploads(resource),
};

export default uploadService;
