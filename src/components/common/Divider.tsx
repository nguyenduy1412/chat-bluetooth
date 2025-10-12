import React from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import { Box } from './Layout/Box';
import { useTheme } from '@react-navigation/native';

interface DividerProps {
  color?: string;
  thickness?: number;
  margin?: number;
  vertical?: boolean;
  style?: ViewStyle;
}

const Divider: React.FC<DividerProps> = ({
  color,
  thickness = StyleSheet.hairlineWidth,
  margin = 0,
  vertical = false,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <Box
      style={[
        vertical ? styles.vertical : styles.horizontal,
        vertical
          ? { width: thickness, height: '100%', marginHorizontal: margin }
          : { height: thickness, width: '100%', marginVertical: margin },
        { backgroundColor: color || colors.border },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
    alignSelf: 'center',
  },
  vertical: {
    height: '100%',
    alignSelf: 'center',
  },
});

export default Divider;
