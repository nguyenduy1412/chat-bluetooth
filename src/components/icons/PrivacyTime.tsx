import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PrivacyTimeProps {
    size?: number;
    color?: string;
    strokeWidth?: number;
}

const PrivacyTime: React.FC<PrivacyTimeProps> = ({
    size = 24,
    color = 'black',
    strokeWidth = 2,
}) => {
    return (
        <Svg
            width={size}
            height={size}
            fill="none"

        >
            <Path
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={strokeWidth}
                d="M20.75 13.25c0 4.83-3.92 8.75-8.75 8.75s-8.75-3.92-8.75-8.75S7.17 4.5 12 4.5s8.75 3.92 8.75 8.75ZM12 8v5"
            />
            <Path
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit={10}
                strokeWidth={strokeWidth}
                d="M9 2h6"
            />
        </Svg>
    );
};

export default PrivacyTime; 