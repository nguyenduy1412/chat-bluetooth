import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SearchProps {
  size?: number;
  color?: string;
}

const Search: React.FC<SearchProps> = ({ 
  size = 16, 
  color = '#808080' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M7.66659 14C11.1644 14 13.9999 11.1645 13.9999 7.66671C13.9999 4.1689 11.1644 1.33337 7.66659 1.33337C4.16878 1.33337 1.33325 4.1689 1.33325 7.66671C1.33325 11.1645 4.16878 14 7.66659 14Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.6666 14.6667L13.3333 13.3334"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Search; 