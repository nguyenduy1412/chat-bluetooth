import { User } from '@/database/entities/User';
import { queryClient } from '@/lib/react-query';
import { useMutation } from '@tanstack/react-query';
import { updateUser } from '../api/updateUser';

type UpdateUserVariables = {
  id: string;
  data: Partial<User>;
}
export const useUpdateUser = () => {
  return useMutation({
    mutationFn: ({id, data}: UpdateUserVariables) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      console.error('Error updating user:', error);
    },
  });
};