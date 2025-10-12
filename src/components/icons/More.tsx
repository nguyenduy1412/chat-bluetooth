import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from './types';

const MoreIcon = ({ size = 20, color = '#000000', ...rest }: IconProps) => (
  <Svg width={size} height={size} fill="none" {...rest}>
    <Path
      stroke={color}
      d="M4.167 8.333C3.25 8.333 2.5 9.083 2.5 10s.75 1.667 1.667 1.667c.916 0 1.666-.75 1.666-1.667s-.75-1.667-1.666-1.667ZM15.833 8.333c-.916 0-1.666.75-1.666 1.667s.75 1.667 1.666 1.667c.917 0 1.667-.75 1.667-1.667s-.75-1.667-1.667-1.667ZM10 8.333c-.917 0-1.667.75-1.667 1.667s.75 1.667 1.667 1.667 1.667-.75 1.667-1.667-.75-1.667-1.667-1.667Z"
    />
  </Svg>
);

export default MoreIcon;
