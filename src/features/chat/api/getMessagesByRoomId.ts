import {MessageEntity} from '@/database/entities/MessageEntity';
import {MessageRepository} from '@/database/repositories/MessageRepository';

export const getMessagesByRoomId = async (
  roomId?: string,
): Promise<MessageEntity[]> => {
  if (!roomId) return [];
  const messageRepo = new MessageRepository();
  const messages = await messageRepo.findByRoomId(roomId);
  return messages;
};
