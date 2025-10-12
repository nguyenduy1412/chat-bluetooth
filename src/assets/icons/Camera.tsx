import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
function Camera(props: SvgProps) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
      <Rect width={20} height={20} rx={10} fill="#75B523" />
      <Path
        d="M6.5 7.5H7a1 1 0 001-1 .5.5 0 01.5-.5h3a.5.5 0 01.5.5 1 1 0 001 1h.5a1 1 0 011 1V13a1 1 0 01-1 1h-7a1 1 0 01-1-1V8.5a1 1 0 011-1z"
        stroke="#F2F2F2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 10.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0z"
        stroke="#F2F2F2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default Camera;
