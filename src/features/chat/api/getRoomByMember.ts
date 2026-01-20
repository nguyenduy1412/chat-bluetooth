import {Room} from '@/database/entities/Room';
import {RoomRepository} from '@/database/repositories/RoomRepository';
import {createRoom} from './createRoom';

export const getRoomByMember = async (
  userId1: string,
  userId2: string,
): Promise<Room> => {
  console.log('🔍 getRoomByMember called');
  console.log('   User 1:', userId1);
  console.log('   User 2:', userId2);

  const roomRepo = new RoomRepository();
  const room = await roomRepo.findPrivateRoom(userId1, userId2);

  if (!room) {
    console.log('❌ No existing room found, creating new one...');

    // Tạo deterministic room ID từ 2 user IDs
    // Sắp xếp để đảm bảo cả 2 bên tạo cùng 1 ID
    const sortedIds = [userId1, userId2].sort();
    const roomId = `${sortedIds[0]}_${sortedIds[1]}`;

    const room1: Room = {
      id: roomId,
      memberArray: [userId1, userId2],
      type: 'private',
      messages: [],
    };

    console.log('🆔 Creating room with deterministic ID:', roomId);
    console.log('   Sorted IDs:', sortedIds);

    const newRoom = await createRoom(room1);
    console.log('✅ Room created successfully:', newRoom.id);
    return newRoom;
  }

  console.log('✅ Found existing room:', room.id);
  return room;
};
