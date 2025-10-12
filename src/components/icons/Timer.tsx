import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from './types';

const TimerIcon = ({ size = 18, color = '#063855', ...rest }: IconProps) => (
  <Svg width={size} height={size} fill="none" {...rest}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.563 9.938A6.565 6.565 0 0 1 9 16.5a6.565 6.565 0 0 1-6.563-6.563A6.565 6.565 0 0 1 9 3.375a6.565 6.565 0 0 1 6.563 6.563ZM9 6v3.75"
    />
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      d="M6.75 1.5h4.5"
    />
  </Svg>
);

export default TimerIcon;
