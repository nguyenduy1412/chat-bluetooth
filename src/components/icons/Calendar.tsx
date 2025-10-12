import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CalendarProps {
  size?: number;
  color?: string;
}

const Calendar: React.FC<CalendarProps> = ({ 
  size = 16, 
  color = 'black' 
}) => {
  return (
    <Svg width={size} height={size * (17/16)} viewBox="0 0 16 17" fill="none">
      <Path
        d="M5.33337 1.83331V3.83331"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.6666 1.83331V3.83331"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.33337 6.56H13.6667"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 6.16665V11.8333C14 13.8333 13 15.1666 10.6667 15.1666H5.33333C3 15.1666 2 13.8333 2 11.8333V6.16665C2 4.16665 3 2.83331 5.33333 2.83331H10.6667C13 2.83331 14 4.16665 14 6.16665Z"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.4631 9.63332H10.4691"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.4631 11.6333H10.4691"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.99703 9.63332H8.00302"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.99703 11.6333H8.00302"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.5295 9.63332H5.53549"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.5295 11.6333H5.53549"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Calendar; 