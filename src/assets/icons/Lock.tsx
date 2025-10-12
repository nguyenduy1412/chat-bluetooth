import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
function Lock(props: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M6 10V8c0-3.31 1-6 6-6s6 2.69 6 6v2M12 18.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
        stroke="#000"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17 22H7c-4 0-5-1-5-5v-2c0-4 1-5 5-5h10c4 0 5 1 5 5v2c0 4-1 5-5 5z"
        stroke="#000"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default Lock;
