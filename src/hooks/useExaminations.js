import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import examinationsService from '../api/examinations.service';

export function useExaminations({ page = 1, pageSize = 10, search = '', filter = '', examType = '' } = {}) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['examinations', { page, pageSize, search, filter, examType }],
    queryFn: examinationsService.fetchExaminations,
    keepPreviousData: true,
    staleTime: 1000 * 60,
  });

  const createMutation = useMutation({
    mutationFn: examinationsService.createExamination,
    onSettled: () => queryClient.invalidateQueries(['examinations']),
  });
  const updateMutation = useMutation({
    mutationFn: examinationsService.updateExamination,
    onSettled: () => queryClient.invalidateQueries(['examinations']),
  });
  const deleteMutation = useMutation({
    mutationFn: examinationsService.deleteExamination,
    onSettled: () => queryClient.invalidateQueries(['examinations']),
  });
  const publishResultsMutation = useMutation({
    mutationFn: examinationsService.publishExaminationResults,
    onSettled: () => queryClient.invalidateQueries(['examinations']),
  });
  const generateHallTicketsMutation = useMutation({
    mutationFn: examinationsService.generateHallTickets,
    onSettled: () => queryClient.invalidateQueries(['examinations']),
  });

  return {
    ...listQuery,
    createExamination: createMutation,
    updateExamination: updateMutation,
    deleteExamination: deleteMutation,
    publishExaminationResults: publishResultsMutation,
    generateHallTickets: generateHallTicketsMutation,
  };
}
