import { useMutation } from '@tanstack/react-query';
import { createMessage } from '../api/createMessage';
import { MessageEntity } from '@/database/entities/MessageEntity';
import { queryClient } from '@/lib/react-query';

export const useCreateMessage = () => {
  return useMutation({
    mutationFn: (data: MessageEntity) => createMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};
