import { MessageEntity } from "@/database/entities/MessageEntity";
import { MessageRepository } from "@/database/repositories/MessageRepository";

/**
 * Get last message of a room
 */
export const getLastMessage = async (roomId: string): Promise<MessageEntity | null> => {
  const messageRepo = new MessageRepository();
  return await messageRepo.getLastMessageByRoomId(roomId);
};
