import { useQuery } from '@tanstack/react-query';

import { QueryConfig } from '@/types/api';
import { getRoomsByUserId } from '../api/getRoomsByUserId';

type useGetRoomsByUserIdOptions = {
  id: string;
  queryConfig?: QueryConfig<typeof getRoomsByUserId>;
};

export const useGetRoomsByUserId = ({
  id,
  queryConfig,
}: useGetRoomsByUserIdOptions) => {
  return useQuery({
    queryKey: ['rooms', id],
    queryFn: () => getRoomsByUserId(id),
    ...queryConfig,
  });
};
