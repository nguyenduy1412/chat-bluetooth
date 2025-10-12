import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
function NotificationBing(props: SvgProps) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
      <Path
        d="M10 5.367v2.775M10.017 1.667a5.548 5.548 0 00-5.55 5.55v1.75c0 .566-.234 1.416-.525 1.9l-1.059 1.766c-.65 1.092-.2 2.309 1 2.709a19.45 19.45 0 0012.275 0 1.85 1.85 0 001-2.709L16.1 10.867c-.292-.484-.525-1.342-.525-1.9v-1.75c-.008-3.05-2.508-5.55-5.558-5.55z"
        stroke="#000"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
      />
      <Path
        d="M12.775 15.683A2.785 2.785 0 0110 18.458a2.78 2.78 0 01-1.958-.817c-.5-.5-.817-1.2-.817-1.958"
        stroke="#000"
        strokeWidth={1.5}
        strokeMiterlimit={10}
      />
    </Svg>
  );
}

export default NotificationBing;
