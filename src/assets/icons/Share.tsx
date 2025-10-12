import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
function Share(props: SvgProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none" {...props}>
      <Path
        d="M15.07 8.158c3.3.284 4.648 1.98 4.648 5.693v.119c0 4.097-1.641 5.738-5.739 5.738H8.012c-4.098 0-5.739-1.64-5.739-5.738v-.12c0-3.684 1.33-5.38 4.575-5.683M11 13.75V3.318M14.07 5.362L11 2.292l-3.07 3.07"
        stroke="#75B523"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default Share;
