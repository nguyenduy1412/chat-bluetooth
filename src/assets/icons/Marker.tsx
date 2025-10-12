import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
function Marker(props: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        d="M8.121.007a6.12 6.12 0 00-6.4 6.4c0 2.016 1.6 4 2.4 4.8.8.8 4 4.8 4 4.8s3.2-4 4-4.8c.8-.8 2.4-2.784 2.4-4.8a6.12 6.12 0 00-6.4-6.4zm0 9a2.6 2.6 0 110-5.2 2.6 2.6 0 010 5.2z"
        fill="#E40001"
      />
    </Svg>
  );
}

export default Marker;
