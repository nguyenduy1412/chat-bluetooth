import { MessageRepository } from "@/database/repositories/MessageRepository";

/**
 * Get unread message count for a room
 */
export const getUnreadCount = async (roomId: string, userId: string): Promise<number> => {
  const messageRepo = new MessageRepository();
  return await messageRepo.countUnreadInRoom(roomId, userId);
};
