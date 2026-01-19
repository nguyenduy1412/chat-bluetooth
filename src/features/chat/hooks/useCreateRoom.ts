import { queryClient } from '@/lib/react-query';
import { useMutation } from '@tanstack/react-query';
import { createRoom } from '../api/createRoom';
import { Room } from '@/database/entities/Room';

export const useCreateRoom = () => {
  return useMutation({
    mutationFn: (data: Room) => createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (error: Error) => {
      console.error('Error creating room:', error);
    },
  });
};
