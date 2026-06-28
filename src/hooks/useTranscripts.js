import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import transcriptsService from '../api/transcripts.service';

export function useTranscripts({ studentId = '', search = '', page = 1, pageSize = 20 } = {}) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['transcripts', { studentId, search, page, pageSize }],
    queryFn: transcriptsService.fetchTranscripts,
    keepPreviousData: true,
    staleTime: 1000 * 60,
  });

  const createMutation = useMutation({
    mutationFn: transcriptsService.createTranscript,
    onSettled: () => queryClient.invalidateQueries(['transcripts']),
  });
  const updateMutation = useMutation({
    mutationFn: transcriptsService.updateTranscript,
    onSettled: () => queryClient.invalidateQueries(['transcripts']),
  });
  const deleteMutation = useMutation({
    mutationFn: transcriptsService.deleteTranscript,
    onSettled: () => queryClient.invalidateQueries(['transcripts']),
  });
  const exportMutation = useMutation({
    mutationFn: transcriptsService.exportTranscript,
  });

  return {
    ...listQuery,
    createTranscript: createMutation,
    updateTranscript: updateMutation,
    deleteTranscript: deleteMutation,
    exportTranscript: exportMutation,
  };
}
