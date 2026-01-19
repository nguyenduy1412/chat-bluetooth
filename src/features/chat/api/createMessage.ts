import { MessageEntity } from "@/database/entities/MessageEntity";
import { MessageRepository } from "@/database/repositories/MessageRepository";
import { v4 } from "uuid";

export const createMessage = async (messageData: MessageEntity): Promise<MessageEntity> => {
  messageData.id = v4();
  const messageRepo = new MessageRepository();
  const newMessage = await messageRepo.create(messageData);
  return newMessage;
};