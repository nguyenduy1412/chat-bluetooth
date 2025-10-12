import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from './types';

const PlusIcon = ({ color = '#FFFFFF', size = 20, ...rest }: IconProps) => (
  <Svg width={size} height={size} fill="none" {...rest}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M5.5 11h11M11 16.5v-11"
    />
  </Svg>
);

export default PlusIcon;
