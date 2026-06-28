import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import resultsService from '../api/results.service';

export function useResults({ page = 1, pageSize = 20, search = '', filter = '' } = {}) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['results', { page, pageSize, search, filter }],
    queryFn: resultsService.fetchResults,
    keepPreviousData: true,
    staleTime: 1000 * 60,
  });

  const createMutation = useMutation({
    mutationFn: resultsService.createResult,
    onMutate: async (newResult) => {
      await queryClient.cancelQueries(['results']);
      const previous = queryClient.getQueryData(['results', { page, pageSize, search, filter }]);
      queryClient.setQueryData(['results', { page, pageSize, search, filter }], (old = { items: [] }) => ({ ...old, items: [newResult, ...(old.items || [])] }));
      return { previous };
    },
    onError: (err, newResult, context) => {
      if (context?.previous) queryClient.setQueryData(['results', { page, pageSize, search, filter }], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries(['results']),
  });

  const updateMutation = useMutation({
    mutationFn: resultsService.updateResult,
    onSuccess: () => queryClient.invalidateQueries(['results']),
  });

  const deleteMutation = useMutation({
    mutationFn: resultsService.deleteResult,
    onSuccess: () => queryClient.invalidateQueries(['results']),
  });

  const publishMutation = useMutation({
    mutationFn: resultsService.publishResult,
    onSettled: () => queryClient.invalidateQueries(['results']),
  });

  return {
    ...listQuery,
    createResult: createMutation,
    updateResult: updateMutation,
    deleteResult: deleteMutation,
    publishResult: publishMutation,
  };
}
