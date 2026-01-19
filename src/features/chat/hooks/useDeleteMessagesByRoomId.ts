import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMessagesByRoomId } from '../api/deleteMessagesByRoomId';

export const useDeleteMessagesByRoomId = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: deleteMessagesByRoomId,
    onSuccess: (_, roomId) => {
      // Invalidate messages của room đó
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};
