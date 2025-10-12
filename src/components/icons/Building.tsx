import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BuildingProps {
  size?: number;
  color?: string;
}

const Building: React.FC<BuildingProps> = ({ 
  size = 16, 
  color = '#808080' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M1.33337 14.6667H14.6667"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.3333 1.33331H4.66667C2.66667 1.33331 2 2.52665 2 3.99998V14.6666H14V3.99998C14 2.52665 13.3333 1.33331 11.3333 1.33331Z"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.66663 11H6.66663"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.33337 11H11.3334"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.66663 8H6.66663"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.33337 8H11.3334"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.66663 5H6.66663"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.33337 5H11.3334"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Building; 