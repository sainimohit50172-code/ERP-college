import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createResourceService from '../api/resourceService';
import { parseApiError } from '../api/errorHandler';
import api from '../api/axios';
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
  return useMutation({
    mutationFn: (payload) => service.create(payload),
    onSuccess: () => qc.invalidateQueries([resource]),
    onError: (err) => { throw parseApiError(err); },
  });
}

export function useUpdateResource(resource) {
  const service = createResourceService(resource);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => service.update(id, payload),
    onSuccess: () => qc.invalidateQueries([resource]),
    onError: (err) => { throw parseApiError(err); },
  });
}

export function useDeleteResource(resource) {
  const service = createResourceService(resource);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => service.remove(id),
    onSuccess: () => qc.invalidateQueries([resource]),
    onError: (err) => { throw parseApiError(err); },
  });
}

export function useSearchResource(resource) {
  const service = createResourceService(resource);
  return async (q) => service.search(q);
}

export function useBulkImport(resource) {
  const qc = useQueryClient();
  return useMutation(
    (formData) => api.post(`/${getEndpoint(resource)}/import`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    {
      onSuccess: () => qc.invalidateQueries([resource]),
      onError: (err) => { throw parseApiError(err); },
    },
  );
}

export function useBulkExport(resource) {
  const qc = useQueryClient();
  return useMutation(
    async (params = {}) => {
      const response = await uploadService.download(resource, params);
      return response;
    },
    {
      onError: (err) => { throw parseApiError(err); },
    },
  );
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
