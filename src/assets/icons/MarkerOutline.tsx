import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
function MarkerOutline(props: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        d="M8 8.953a2.08 2.08 0 100-4.16 2.08 2.08 0 000 4.16z"
        stroke="gray"
      />
      <Path
        d="M2.413 5.66c1.314-5.773 9.867-5.767 11.174.007.766 3.386-1.34 6.253-3.187 8.026a3.462 3.462 0 01-4.807 0c-1.84-1.773-3.946-4.646-3.18-8.033z"
        stroke="gray"
      />
    </Svg>
  );
}

export default MarkerOutline;
