import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from './types';

const ShareIcon = ({ size = 20, color = '#75B523', ...rest }: IconProps) => (
  <Svg width={size} height={size} fill="none" {...rest}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12.33 6.675c2.7.232 3.803 1.62 3.803 4.657v.098c0 3.353-1.343 4.695-4.695 4.695H6.555c-3.352 0-4.695-1.342-4.695-4.695v-.098c0-3.015 1.088-4.402 3.743-4.65M9 11.25V2.715M11.512 4.388 9 1.875 6.488 4.388"
    />
  </Svg>
);

export default ShareIcon;
