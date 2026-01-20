import {v4} from 'uuid';
import {Room} from '@/database/entities/Room';
import {RoomRepository} from '@/database/repositories/RoomRepository';

export const createRoom = async (room: Room): Promise<Room | null> => {
  const roomRepo = new RoomRepository();

  console.log('🔧 createRoom called with ID:', room.id);

  if (room.id) {
    const existingRoom = await roomRepo.findById(room.id);
    if (existingRoom) {
      console.log('   ✅ Found existing room:', existingRoom.id);
      return existingRoom;
    }
  } else {
    room.id = v4();
    console.log('   🆕 Generated new room ID:', room.id);
  }

  try {
    const newRoom = await roomRepo.create(room);
    console.log('   ✅ Created new room in DB:', newRoom.id);
    return newRoom;
  } catch (error: any) {
    // Nếu lỗi UNIQUE constraint (race condition - bên kia đã tạo room)
    if (error.message?.includes('UNIQUE constraint failed')) {
      console.log(
        '   ⚠️ Room already exists (created by other device), fetching...',
      );
      const existingRoom = await roomRepo.findById(room.id!);
      if (existingRoom) {
        console.log(
          '   ✅ Found room created by other device:',
          existingRoom.id,
        );
        return existingRoom;
      }
    }
    // Lỗi khác, throw lại
    console.error('   ❌ Error creating room:', error);
    throw error;
  }
};
