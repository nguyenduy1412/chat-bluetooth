import { useQuery } from '@tanstack/react-query';

import { QueryConfig } from '@/types/api';
import { getUserByAttributes } from '../api/getUserByAttributes';

type useGetUserByAttributesOptions = {
  name: string;
  queryConfig?: QueryConfig<typeof getUserByAttributes>;
};

export const useGetUserByAttributes = ({
  name,
  queryConfig,
}: useGetUserByAttributesOptions) => {
  return useQuery({
    queryKey: ['users-name', name],
    queryFn: () => getUserByAttributes({ name }),
    ...queryConfig,
  });
};
