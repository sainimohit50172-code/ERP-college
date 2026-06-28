import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import attendanceService from '../api/attendance.service';

export function useLectureAttendance() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['lectureAttendance'],
    queryFn: attendanceService.fetchLectureAttendance,
    staleTime: 1000 * 60 * 1,
  });

  const mutation = useMutation({
    mutationFn: attendanceService.createLectureAttendance,
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries(['lectureAttendance']);
      const previous = queryClient.getQueryData(['lectureAttendance']);
      queryClient.setQueryData(['lectureAttendance'], (old = []) => [newEntry, ...old]);
      return { previous };
    },
    onError: (err, newEntry, context) => {
      queryClient.setQueryData(['lectureAttendance'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['lectureAttendance']);
    },
  });

  return { ...query, createLectureAttendance: mutation };
}
