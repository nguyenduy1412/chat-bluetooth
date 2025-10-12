import * as React from 'react';
import Svg, { G, Rect, Path, Defs, ClipPath } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
function XFill(props: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#clip0_276_2700)">
        <Rect width={24} height={24} rx={12} fill="#121212" />
        <Path
          d="M8.467 15.536l7.07-7.071M15.538 15.535l-7.071-7.07"
          stroke="#F2F2F2"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_276_2700">
          <Rect width={24} height={24} rx={12} fill="#fff" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default XFill;
