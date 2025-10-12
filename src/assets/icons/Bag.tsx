import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
function Bag(props: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        d="M5.333 14.667h5.334c2.68 0 3.16-1.074 3.3-2.38l.5-5.334C14.647 5.327 14.18 4 11.333 4H4.667C1.82 4 1.353 5.327 1.533 6.953l.5 5.334c.14 1.306.62 2.38 3.3 2.38zM5.333 4v-.533c0-1.18 0-2.134 2.134-2.134h1.066c2.134 0 2.134.954 2.134 2.134V4"
        stroke="gray"
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.333 8.667v.68c0 .726-.006 1.32-1.333 1.32-1.32 0-1.333-.587-1.333-1.314v-.686c0-.667 0-.667.666-.667h1.334c.666 0 .666 0 .666.667zM14.433 7.333a10.99 10.99 0 01-5.1 2.014M1.747 7.513a10.855 10.855 0 004.92 1.84"
        stroke="gray"
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default Bag;
