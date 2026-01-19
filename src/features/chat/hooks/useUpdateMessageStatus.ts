import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMessageStatus } from '../api/updateMessageStatus';

export const useUpdateMessageStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { messageId: string; status: 'sent' | 'delivered' | 'read' | 'failed' }>({
    mutationFn: ({ messageId, status }) => updateMessageStatus(messageId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};
