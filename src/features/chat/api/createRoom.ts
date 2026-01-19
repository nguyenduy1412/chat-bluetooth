import { v4 } from "uuid";
import { Room } from "@/database/entities/Room";
import { RoomRepository } from "@/database/repositories/RoomRepository";
export const createRoom = async (room: Room): Promise<Room> => {
  const roomRepo = new RoomRepository();
  const newRoom = await roomRepo.create(room);
  return newRoom;
};