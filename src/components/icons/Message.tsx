import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from './types';

const Message = ({ size = 20, color = '#999', ...rest }: IconProps) => (
  <Svg width={size} height={size} fill="none" {...rest}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M7.708 15.833h-.416c-3.334 0-5-.833-5-5V6.666c0-3.333 1.666-5 5-5h6.666c3.334 0 5 1.667 5 5v4.167c0 3.333-1.666 5-5 5h-.416a.845.845 0 0 0-.667.333l-1.25 1.667c-.55.734-1.45.734-2 0l-1.25-1.666c-.133-.184-.442-.334-.667-.334Z"
    />
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.955 9.167h.008M10.621 9.167h.008M7.287 9.167h.008"
    />
  </Svg>
);

export default Message;
