import { MessageRepository } from "@/database/repositories/MessageRepository";

/**
 * Update message status
 */
export const updateMessageStatus = async (
  messageId: string, 
  status: 'sent' | 'delivered' | 'read' | 'failed'
): Promise<boolean> => {
  const messageRepo = new MessageRepository();
  const result = await messageRepo.updateStatus(messageId, status);
  return !!result;
};
