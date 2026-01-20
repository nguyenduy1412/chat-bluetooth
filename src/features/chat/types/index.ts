import {MessageEntity} from '@/database/entities/MessageEntity';
import {User} from '@/database/entities/User';

export interface RoomResponse {
  id: string;
  name?: string;
  type?: string;
  image?: string;
  lastMessage?: MessageEntity | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BluetoothDevice {
  name: string;
  address: string;
  bondState: 'BONDED' | 'BONDING' | 'NONE' | 'UNKNOWN';
}

export interface ConnectedDevice {
  name: string;
  address: string;
}
export interface RoomInfo {
  roomId: string;
  receiver: User;
}

export interface ImageChunk {
  chunks: string[];
  totalChunks: number;
  receivedChunks: number;
  timestamp: number;
  senderName: string;
  senderAddress: string;
}
