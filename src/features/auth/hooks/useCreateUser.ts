import { User } from '@/database/entities/User';
import { queryClient } from '@/lib/react-query';
import { useMutation } from '@tanstack/react-query';
import { createUser } from '../api/createUser';

export const useCreateUser = () => {
  return useMutation({
    mutationFn: (data: User) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      console.error('Error creating user:', error);
    },
  });
};
