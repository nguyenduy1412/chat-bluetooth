import {RoomRepository} from '@/database/repositories/RoomRepository';
import {RoomResponse} from '../types';
import {userStore} from '@/store/userStore';
import { getUserById } from '@/features/auth/api/getUserById';
import { User } from '@/database/entities/User';
import { MessageRepository } from '@/database/repositories/MessageRepository';

export const getRoomsByUserId = async (
  userId: string,
): Promise<RoomResponse[]> => {
  const user = userStore(state => state.user);
  const roomRepo = new RoomRepository();
  const messageRepo = new MessageRepository();
  const rooms = await roomRepo.findByUserId(userId);
  if (rooms.length > 0) {
    const listRooms: RoomResponse[] = [];
    rooms.map(async room => {
      const receiverId = room.memberArray.find(id => id !== user?.id);
      const receiver: User | null = await getUserById(receiverId);
      if(receiver){
        const lastMess = await messageRepo.getLastMessageByRoomId(room.id);
        const item: RoomResponse = {
          id: room.id,
          name: receiver?.name,
          image: receiver?.image,
          type: room.type,
          lastMessage: lastMess,
        }
        listRooms.push(item);
      }
    });
    return listRooms;
  }
  return [];
};
