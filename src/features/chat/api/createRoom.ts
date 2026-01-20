import { v4 } from "uuid";
import { Room } from "@/database/entities/Room";
import { RoomRepository } from "@/database/repositories/RoomRepository";
export const createRoom = async (room: Room): Promise<Room | null> => {
  const roomRepo = new RoomRepository();
  if(room.id){
    const existingRoom = await roomRepo.findById(room.id);
    if(existingRoom)
      return existingRoom;
  }else{
    room.id = v4();
  }
  const newRoom = await roomRepo.create(room);
  return newRoom;
};