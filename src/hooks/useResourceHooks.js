import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createResourceService from '../api/resourceService';
import { parseApiError } from '../api/errorHandler';
import api from '../api/axios';
import { useAuth } from '../services/AuthContext.jsx';
import { recordAuditEvent } from '../services/auditService.js';
import { getEndpoint } from '../api/endpoints';
import uploadService from '../api/uploadService';

export function useResourceList(resource, params = {}) {
  const service = createResourceService(resource);
  return useQuery({ queryKey: [resource, params], queryFn: () => service.list(params), keepPreviousData: true });
}

export function useResourceDetails(resource, id) {
  const service = createResourceService(resource);
  return useQuery({ queryKey: [resource, 'details', id], queryFn: () => service.get(id), enabled: !!id });
}

export function useCreateResource(resource) {
  const service = createResourceService(resource);
  const qc = useQueryClient();
  const { auth } = useAuth();
  return useMutation({
    mutationFn: (payload) => service.create(payload),
    onSuccess: (data) => {
      qc.invalidateQueries([resource]);
      recordAuditEvent({
        action: 'Create',
        moduleKey: resource,
        description: `Created new ${resource}`,
        resourceId: data?.id ?? null,
        user: auth?.user ? { id: auth.user.id, name: auth.user.name, role: auth.role } : null,
      });
    },
    onError: (err) => { throw parseApiError(err); },
  });
}

export function useUpdateResource(resource) {
  const service = createResourceService(resource);
  const qc = useQueryClient();
  const { auth } = useAuth();
  return useMutation({
    mutationFn: ({ id, payload }) => service.update(id, payload),
    onSuccess: (data, variables) => {
      qc.invalidateQueries([resource]);
      recordAuditEvent({
        action: 'Update',
        moduleKey: resource,
        description: `Updated ${resource} ${variables?.id ?? ''}`,
        resourceId: variables?.id ?? data?.id ?? null,
        user: auth?.user ? { id: auth.user.id, name: auth.user.name, role: auth.role } : null,
      });
    },
    onError: (err) => { throw parseApiError(err); },
  });
}

export function useDeleteResource(resource) {
  const service = createResourceService(resource);
  const qc = useQueryClient();
  const { auth } = useAuth();
  return useMutation({
    mutationFn: (id) => service.remove(id),
    onSuccess: (data, id) => {
      qc.invalidateQueries([resource]);
      recordAuditEvent({
        action: 'Delete',
        moduleKey: resource,
        description: `Deleted ${resource} ${id}`,
        resourceId: id,
        user: auth?.user ? { id: auth.user.id, name: auth.user.name, role: auth.role } : null,
      });
    },
    onError: (err) => { throw parseApiError(err); },
  });
}

export function useSearchResource(resource) {
  const service = createResourceService(resource);
  return async (q) => service.search(q);
}

export function useBulkImport(resource) {
  const qc = useQueryClient();
  const { auth } = useAuth();
  return useMutation({
    mutationFn: (formData) => api.post(`/${getEndpoint(resource)}/import`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      qc.invalidateQueries([resource]);
      recordAuditEvent({
        action: 'Import',
        moduleKey: resource,
        description: `Imported data into ${resource}`,
        user: auth?.user ? { id: auth.user.id, name: auth.user.name, role: auth.role } : null,
      });
    },
    onError: (err) => { throw parseApiError(err); },
  });
}

export function useBulkExport(resource) {
  const { auth } = useAuth();
  return useMutation({
    mutationFn: async (params = {}) => {
      const response = await uploadService.download(resource, params);
      recordAuditEvent({
        action: 'Export',
        moduleKey: resource,
        description: `Exported data from ${resource}`,
        user: auth?.user ? { id: auth.user.id, name: auth.user.name, role: auth.role } : null,
      });
      return response;
    },
    onError: (err) => { throw parseApiError(err); },
  });
}

export default {
  useResourceList,
  useResourceDetails,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
  useSearchResource,
  useBulkImport,
  useBulkExport,
};
