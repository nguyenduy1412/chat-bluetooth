import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
function Plane(props: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        d="M6.02 14.46l1.553-1.307c.234-.2.62-.2.854 0L9.98 14.46c.36.18.8 0 .933-.387l.294-.886a.737.737 0 00-.16-.687l-1.514-1.52a.741.741 0 01-.2-.473v-1.9c0-.28.207-.414.467-.307l3.273 1.413c.514.22.934-.053.934-.613v-.86c0-.447-.334-.96-.747-1.133L9.533 5.5a.37.37 0 01-.2-.307v-2c0-.626-.46-1.366-1.02-1.653-.2-.1-.433-.1-.633 0-.56.287-1.02 1.033-1.02 1.66v2a.37.37 0 01-.2.307L2.74 7.113c-.413.167-.747.68-.747 1.127v.86c0 .56.42.833.934.613L6.2 8.3c.253-.113.467.027.467.307v1.9a.77.77 0 01-.194.473L4.96 12.5a.733.733 0 00-.16.687l.293.886c.12.387.56.574.927.387z"
        stroke="gray"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default Plane;
