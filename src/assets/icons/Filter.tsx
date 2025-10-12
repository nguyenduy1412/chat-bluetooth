import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
function Filter(props: SvgProps) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
      <Path
        d="M18.333 5.417h-5M5 5.417H1.667M8.333 8.333a2.917 2.917 0 100-5.833 2.917 2.917 0 000 5.833zM18.333 14.583H15M6.667 14.583h-5M11.667 17.5a2.917 2.917 0 100-5.833 2.917 2.917 0 000 5.833z"
        stroke={props.color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default Filter;
