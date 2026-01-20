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

  const newRoom = await roomRepo.create(room);
  console.log('   ✅ Created new room in DB:', newRoom.id);
  return newRoom;
};
