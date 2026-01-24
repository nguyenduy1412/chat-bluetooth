import {User} from '@/database/entities/User';
import {queryClient} from '@/lib/react-query';
import {useMutation} from '@tanstack/react-query';
import {updateUser} from '../api/updateUser';
import {userStore} from '@/store/userStore';

type UpdateUserVariables = {
  id: string;
  data: Partial<User>;
};
export const useUpdateUser = () => {
  const {setUser} = userStore();
  return useMutation({
    mutationFn: ({id, data}: UpdateUserVariables) => updateUser(id, data),
    onSuccess: userUpdated => {
      queryClient.invalidateQueries({queryKey: ['users']});
      queryClient.invalidateQueries({queryKey: ['rooms']});
      setUser(userUpdated);
    },
    onError: (error: Error) => {
      console.error('Error updating user:', error);
    },
  });
};
