import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SettingsProps {
  size?: number;
  color?: string;
}

const Settings: React.FC<SettingsProps> = ({ 
  size = 16, 
  color = 'black' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M14.6667 4.33337H10.6667"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.99992 4.33337H1.33325"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.66659 6.66667C7.95525 6.66667 8.99992 5.622 8.99992 4.33333C8.99992 3.04467 7.95525 2 6.66659 2C5.37792 2 4.33325 3.04467 4.33325 4.33333C4.33325 5.622 5.37792 6.66667 6.66659 6.66667Z"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.6667 11.6666H12"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.33325 11.6666H1.33325"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.33333 14C10.622 14 11.6667 12.9554 11.6667 11.6667C11.6667 10.378 10.622 9.33337 9.33333 9.33337C8.04467 9.33337 7 10.378 7 11.6667C7 12.9554 8.04467 14 9.33333 14Z"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Settings; 