import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ClockProps {
  size?: number;
  color?: string;
}

const Clock: React.FC<ClockProps> = ({ 
  size = 16, 
  color = '#808080' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M14.6667 7.99998C14.6667 11.68 11.68 14.6666 8.00004 14.6666C4.32004 14.6666 1.33337 11.68 1.33337 7.99998C1.33337 4.31998 4.32004 1.33331 8.00004 1.33331C11.68 1.33331 14.6667 4.31998 14.6667 7.99998Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.4733 10.12L8.40663 8.88665C8.04663 8.67332 7.7533 8.15999 7.7533 7.73999V5.00665"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Clock; 