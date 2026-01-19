import {User} from '@/database/entities/User';
import {UserRepository} from '@/database/repositories/UserRepository';

export const getUserById = async (userId?: string | null): Promise<User | null> => {
  const userRepo = new UserRepository();
  if (!userId) {
    return null;
  }
  return userRepo.findById(userId);
};
