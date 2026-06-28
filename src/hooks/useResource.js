import { useMemo } from 'react';
import { useResourceList, useCreateResource, useUpdateResource, useDeleteResource } from './useResourceHooks';

export function useResource(resource, params = { page: 1, pageSize: 20, search: '', filter: '' }) {
  const list = useResourceList(resource, params);
  const create = useCreateResource(resource);
  const update = useUpdateResource(resource);
  const remove = useDeleteResource(resource);

  return {
    ...list,
    items: list.data?.items || [],
    meta: list.data?.meta || { page: params.page, pageSize: params.pageSize, total: list.data?.total || 0 },
    createItem: create,
    updateItem: update,
    deleteItem: remove,
  };
}
