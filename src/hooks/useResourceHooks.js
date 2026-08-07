import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createResourceService from '../api/resourceService';
import { parseApiError } from '../api/errorHandler';
import api from '../api/axios';
import { useAuth } from '../services/AuthContext.jsx';
import { recordAuditEvent } from '../services/auditService.js';
import { getEndpoint } from '../api/endpoints';
import uploadService from '../api/uploadService';
import { getBackendHealthState, waitForBackendHealth } from '../api/startupReadiness';

export function useResourceList(resource, params = {}) {
  const service = createResourceService(resource);
  const serializedParams = useMemo(() => JSON.stringify(params || {}), [params]);
  const [backendReady, setBackendReady] = useState(Boolean(getBackendHealthState().ready));

  useEffect(() => {
    let isMounted = true;
    const synchronizeBackendReadiness = async () => {
      const ready = await waitForBackendHealth();
      if (isMounted) {
        setBackendReady(ready);
      }
    };

    synchronizeBackendReadiness();
    return () => {
      isMounted = false;
    };
  }, []);

  const query = useQuery({ 
    queryKey: [resource, serializedParams], 
    queryFn: async () => {
      try {
        return await service.list(params);
      } catch (error) {
        console.warn(`Failed to fetch ${resource} from API:`, error?.message);
        // Return empty data on error - component will use fallback/demo data
        return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 10, pages: 0 };
      }
    },
    enabled: backendReady,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: 1,
    retryDelay: 500,
  });
  
  return query;
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
      qc.invalidateQueries({ queryKey: [resource], exact: false });
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
      qc.invalidateQueries({ queryKey: [resource], exact: false });
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
      qc.invalidateQueries({ queryKey: [resource], exact: false });
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
