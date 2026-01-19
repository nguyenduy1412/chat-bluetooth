import { useQuery } from '@tanstack/react-query';
import { getMessagesByRoomId } from '../api/getMessagesByRoomId';
import { MessageEntity } from '@/database/entities/MessageEntity';

export const useGetMessagesByRoomId = (roomId?: string) => {
  return useQuery<MessageEntity[], Error>({
    queryKey: ['messages', roomId],
    queryFn: () => getMessagesByRoomId(roomId),
    enabled: !!roomId,
  });
};