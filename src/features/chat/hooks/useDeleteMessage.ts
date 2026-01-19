import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMessage } from '../api/deleteMessage';

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: deleteMessage,
    onSuccess: () => {
      // Invalidate tất cả message queries
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};
