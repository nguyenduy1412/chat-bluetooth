import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ArrowDownProps {
  size?: number;
  color?: string;
}

const ArrowDown: React.FC<ArrowDownProps> = ({ 
  size = 14, 
  color = 'black' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M11.6199 5.22083L7.81655 9.02416C7.36738 9.47333 6.63238 9.47333 6.18322 9.02416L2.37988 5.22083"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ArrowDown; 