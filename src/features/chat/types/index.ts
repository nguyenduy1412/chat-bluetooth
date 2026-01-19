import { MessageEntity } from '@/database/entities/MessageEntity';

export interface RoomResponse {
  id: string;
  name?: string;
  type?: string;
  image?: string;
  lastMessage?: MessageEntity | null;
  createdAt?: Date;
  updatedAt?: Date;
}