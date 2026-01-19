import { v4 } from "uuid";
import { Room } from "@/database/entities/Room";
import { RoomRepository } from "@/database/repositories/RoomRepository";
import { createRoom } from "./createRoom";
export const getRoomByMember = async (userId1: string, userId2: string): Promise<Room> => {
  const roomRepo = new RoomRepository();
  const room = await roomRepo.findPrivateRoom(userId1, userId2);
  if(!room){
    const room1: Room = {
        memberArray: [userId1, userId2],
        type: 'private',
        messages: [],
        id: v4()
    }
    console.log('Creating new room1', room1);
    const newRoom = await createRoom(room1);
    return newRoom;
  }
  return room;
};