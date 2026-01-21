import {RoomRepository} from '@/database/repositories/RoomRepository';
import {RoomResponse} from '../types';
import {userStore} from '@/store/userStore';
import {getUserById} from '@/features/auth/api/getUserById';
import {User} from '@/database/entities/User';
import {MessageRepository} from '@/database/repositories/MessageRepository';

export const getRoomsByUserId = async (
  userId: string,
): Promise<RoomResponse[]> => {
  try {
    // FIX: Use getState() to access store outside React component
    const user = userStore.getState().user;

    const roomRepo = new RoomRepository();

    const messageRepo = new MessageRepository();

    const rooms = await roomRepo.findByUserId(userId);

    if (rooms.length > 0) {
      const listRooms: RoomResponse[] = [];

      // FIX: Use Promise.all instead of map to wait for all async operations
      await Promise.all(
        rooms.map(async room => {
          const receiverId = room.memberArray.find(id => id !== user?.id);

          const receiver: User | null = await getUserById(receiverId);

          if (receiver) {
            const lastMess = await messageRepo.getLastMessageByRoomId(room.id);
            const item: RoomResponse = {
              id: room.id,
              receiver,
              type: room.type,
              lastMessage: lastMess,
            };
            listRooms.push(item);
          }
        }),
      );

      return listRooms;
    }

    return [];
  } catch (error) {
    console.error('❌ Error in getRoomsByUserId:', error);
    return [];
  }
};
