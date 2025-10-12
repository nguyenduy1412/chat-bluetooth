import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from './types';

const User = ({ size = 20, color = '#F2F2F2', ...rest }: IconProps) => (
  <Svg width={size} height={size} fill="none" {...rest}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15.992 18.017c-.734.216-1.6.316-2.617.316h-5c-1.017 0-1.883-.1-2.617-.316.184-2.167 2.409-3.875 5.117-3.875s4.933 1.708 5.117 3.875Z"
    />
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13.375 1.667h-5c-4.167 0-5.833 1.666-5.833 5.833v5c0 3.15.95 4.875 3.216 5.517.184-2.167 2.409-3.875 5.117-3.875s4.933 1.708 5.117 3.875c2.266-.642 3.216-2.367 3.216-5.517v-5c0-4.167-1.666-5.833-5.833-5.833Zm-2.5 10.141a2.987 2.987 0 0 1-2.983-2.991 2.98 2.98 0 0 1 2.983-2.984 2.98 2.98 0 0 1 2.983 2.984 2.987 2.987 0 0 1-2.983 2.991Z"
    />
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13.858 8.817a2.988 2.988 0 0 1-2.983 2.992 2.987 2.987 0 0 1-2.983-2.992 2.98 2.98 0 0 1 2.983-2.984 2.98 2.98 0 0 1 2.983 2.984Z"
    />
  </Svg>
);

export default User;
