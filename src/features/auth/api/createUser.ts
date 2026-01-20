import { User } from "@/database/entities/User";
import { UserRepository } from "@/database/repositories/UserRepository";
import { v4 } from "uuid";
import DeviceInfo from 'react-native-device-info';
export const createUser = async (userData: User): Promise<User> => {
  const userRepo = new UserRepository();
  if(!userData?.id)
    userData.id = v4();
  const checkUser = await userRepo.findById(userData.id!);
  if (checkUser) {
    return checkUser;
  }
  userData.idDevice = await DeviceInfo.getUniqueId();
  const newUser = await userRepo.create(userData);
  return newUser;
};