import {User} from '@/database/entities/User';
import {UserRepository} from '@/database/repositories/UserRepository';
import {v4} from 'uuid';
import DeviceInfo from 'react-native-device-info';
export const createUser = async (userData: User): Promise<User> => {
  const userRepo = new UserRepository();
  if (!userData?.id) userData.id = v4();
  const checkUser = await userRepo.findById(userData.id!);
  if (checkUser) {
    // Nếu user đã tồn tại -> Update thông tin mới nhất (Avatar, Intin,...)
    const updated = await userRepo.updateUser(checkUser.id!, userData);
    return updated || checkUser;
  }
  userData.idDevice = await DeviceInfo.getUniqueId();
  const newUser = await userRepo.create(userData);
  return newUser;
};
