import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '../api/getUnreadCount';

export const useGetUnreadCount = (roomId: string, userId: string) => {
  return useQuery<number, Error>({
    queryKey: ['unreadCount', roomId, userId],
    queryFn: () => getUnreadCount(roomId, userId),
    enabled: !!roomId && !!userId,
    refetchInterval: 5000, // Auto-refetch every 5s
  });
};
