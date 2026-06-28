import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import gradecardsService from '../api/gradecards.service';

export function useGradeCards({ page = 1, pageSize = 20, search = '', filter = '' } = {}) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['gradeCards', { page, pageSize, search, filter }],
    queryFn: gradecardsService.fetchGradeCards,
    keepPreviousData: true,
    staleTime: 1000 * 60,
  });

  const createMutation = useMutation({
    mutationFn: gradecardsService.createGradeCard,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries(['gradeCards']);
      const prev = queryClient.getQueryData(['gradeCards', { page, pageSize, search, filter }]);
      queryClient.setQueryData(['gradeCards', { page, pageSize, search, filter }], (old = { items: [] }) => ({ ...old, items: [newItem, ...(old.items || [])] }));
      return { prev };
    },
    onError: (err, newItem, context) => {
      if (context?.prev) queryClient.setQueryData(['gradeCards', { page, pageSize, search, filter }], context.prev);
    },
    onSettled: () => queryClient.invalidateQueries(['gradeCards']),
  });

  const updateMutation = useMutation({
    mutationFn: gradecardsService.updateGradeCard,
    onSuccess: () => queryClient.invalidateQueries(['gradeCards']),
  });

  const recalculateMutation = useMutation({
    mutationFn: gradecardsService.recalculateGradeCard,
    onSettled: () => queryClient.invalidateQueries(['gradeCards']),
  });

  const deleteMutation = useMutation({
    mutationFn: gradecardsService.deleteGradeCard,
    onSuccess: () => queryClient.invalidateQueries(['gradeCards']),
  });

  return {
    ...listQuery,
    createGradeCard: createMutation,
    updateGradeCard: updateMutation,
    recalculateGradeCard: recalculateMutation,
    deleteGradeCard: deleteMutation,
  };
}
