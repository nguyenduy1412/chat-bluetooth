import { User } from "@/database/entities/User";
import { UserRepository } from "@/database/repositories/UserRepository";
import DeviceInfo from "react-native-device-info";

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  const userRepo = new UserRepository();
  userData.idDevice = await DeviceInfo.getUniqueId();
  const updatedUser = await userRepo.updateUser(id, userData);
  return updatedUser;
};