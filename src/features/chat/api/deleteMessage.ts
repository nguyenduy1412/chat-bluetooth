import { MessageRepository } from "@/database/repositories/MessageRepository";

export const deleteMessage = async (messageId: string): Promise<boolean> => {
  const messageRepo = new MessageRepository();
  return await messageRepo.delete(messageId);
};
