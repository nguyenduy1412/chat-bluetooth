import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Box } from './Layout/Box';
import { Text } from './Text/Text';

type LoadingProps = {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
  backgroundColor?: string;
  style?: any;
};

const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color,
  text,
  overlay = false,
  backgroundColor,
  style,
}) => {
  const theme = useTheme();

  const defaultColor = color || theme.colors.primary;
  const defaultBackgroundColor =
    backgroundColor || (overlay ? 'rgba(0,0,0,0.3)' : 'transparent');

  const content = (
    <Box
      alignItems="center"
      justifyContent="center"
      flex={overlay ? 1 : undefined}
      backgroundColor={defaultBackgroundColor}
      style={style}
    >
      <ActivityIndicator size={size} color={defaultColor} />
      {text && (
        <Box marginTop={8}>
          <Text fontSize={14} color={theme.colors.text} align="center">
            {text}
          </Text>
        </Box>
      )}
    </Box>
  );

  if (overlay) {
    return <Box style={styles.overlayContainer}>{content}</Box>;
  }

  return content;
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
});

export default Loading;
