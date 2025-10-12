import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface MessageTextProps {
    size?: number;
    color?: string;
    strokeWidth?: number;
}

const MessageText: React.FC<MessageTextProps> = ({
    size = 24,
    color = 'black',
    strokeWidth = 1.5,
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
                d="M16 2H8C4 2 2 4 2 8v13c0 .55.45 1 1 1h13c4 0 6-2 6-6V8c0-4-2-6-6-6Z"
            />
            <Path
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit={10}
                strokeWidth={strokeWidth}
                d="M7 9.5h10M7 14.5h7"
            />
        </Svg>
    );
};

export default MessageText; 