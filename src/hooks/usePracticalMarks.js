import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import practicalMarksService from '../api/practicalMarks.service';

export function usePracticalMarks({ page = 1, pageSize = 20, search = '', filter = '' } = {}) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['practicalMarks', { page, pageSize, search, filter }],
    queryFn: practicalMarksService.fetchPracticalMarks,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1,
  });

  const createMutation = useMutation({
    mutationFn: practicalMarksService.createPracticalMark,
    onMutate: async (newMark) => {
      await queryClient.cancelQueries(['practicalMarks']);
      const previous = queryClient.getQueryData(['practicalMarks', { page, pageSize, search, filter }]);
      queryClient.setQueryData(['practicalMarks', { page, pageSize, search, filter }], (old = { items: [] }) => ({ ...old, items: [newMark, ...(old.items || [])] }));
      return { previous };
    },
    onError: (err, newMark, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['practicalMarks', { page, pageSize, search, filter }], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['practicalMarks']);
    },
  });

  const updateMutation = useMutation({
    mutationFn: practicalMarksService.updatePracticalMark,
    onSuccess: () => queryClient.invalidateQueries(['practicalMarks']),
  });

  const deleteMutation = useMutation({
    mutationFn: practicalMarksService.deletePracticalMark,
    onSuccess: () => queryClient.invalidateQueries(['practicalMarks']),
  });

  return {
    ...listQuery,
    createPracticalMark: createMutation,
    updatePracticalMark: updateMutation,
    deletePracticalMark: deleteMutation,
  };
}
