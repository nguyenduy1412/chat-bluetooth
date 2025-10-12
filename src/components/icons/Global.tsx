import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface GlobalProps {
  size?: number;
  color?: string;
}

const Global: React.FC<GlobalProps> = ({ 
  size = 21, 
  color = '#F2F2F2' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 21 21" fill="none">
      <Path
        d="M10.1251 18.8334C14.7275 18.8334 18.4584 15.1024 18.4584 10.5C18.4584 5.89765 14.7275 2.16669 10.1251 2.16669C5.52271 2.16669 1.79175 5.89765 1.79175 10.5C1.79175 15.1024 5.52271 18.8334 10.1251 18.8334Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.79167 3H7.625C6 7.86667 6 13.1333 7.625 18H6.79167"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.625 3C14.25 7.86667 14.25 13.1333 12.625 18"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.625 13.8333V13C7.49167 14.625 12.7583 14.625 17.625 13V13.8333"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.625 8C7.49167 6.375 12.7583 6.375 17.625 8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Global; 