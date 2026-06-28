import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import questionBankService from '../api/questionBank.service';

export function useQuestionBank({ page = 1, pageSize = 20, search = '', filter = '' } = {}) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['questionBank', { page, pageSize, search, filter }],
    queryFn: questionBankService.fetchQuestions,
    keepPreviousData: true,
    staleTime: 1000 * 60,
  });

  const createMutation = useMutation({
    mutationFn: questionBankService.createQuestion,
    onMutate: async (newQ) => {
      await queryClient.cancelQueries(['questionBank']);
      const previous = queryClient.getQueryData(['questionBank', { page, pageSize, search, filter }]);
      queryClient.setQueryData(['questionBank', { page, pageSize, search, filter }], (old = { items: [] }) => ({ ...old, items: [newQ, ...(old.items || [])] }));
      return { previous };
    },
    onError: (err, newQ, context) => {
      if (context?.previous) queryClient.setQueryData(['questionBank', { page, pageSize, search, filter }], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries(['questionBank']),
  });

  const updateMutation = useMutation({
    mutationFn: questionBankService.updateQuestion,
    onSuccess: () => queryClient.invalidateQueries(['questionBank']),
  });
  const deleteMutation = useMutation({
    mutationFn: questionBankService.deleteQuestion,
    onSuccess: () => queryClient.invalidateQueries(['questionBank']),
  });

  return { ...listQuery, createQuestion: createMutation, updateQuestion: updateMutation, deleteQuestion: deleteMutation };
}
