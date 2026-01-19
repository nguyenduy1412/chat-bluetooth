import { MessageRepository } from "@/database/repositories/MessageRepository";

export const deleteMessagesByRoomId = async (roomId: string): Promise<boolean> => {
  const messageRepo = new MessageRepository();
  return await messageRepo.deleteByRoomId(roomId);
};
