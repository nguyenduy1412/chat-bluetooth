import {User} from '@/database/entities/User';
import {UserRepository} from '@/database/repositories/UserRepository';

export const getAllUser = async (): Promise<User[] | null> => {
  const userRepo = new UserRepository();
  return userRepo.findAll();
};
