import {User} from '@/database/entities/User';
import {UserRepository} from '@/database/repositories/UserRepository';

export const getUserByAttributes = async (object:any): Promise<User | null> => {
  const userRepo = new UserRepository();
  if (!object) {
    return null;
  }
  if(object?.system === true){
    const res = await userRepo.findByAttributes({system: true});
    if(!res){
      const aiUser = await userRepo.create({
        name: 'AI',
        system: true,
      });
      return aiUser;
    }
  }
  return userRepo.findByAttributes(object);
};
