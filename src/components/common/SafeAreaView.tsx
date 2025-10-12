import React, { memo } from 'react';
import type { ViewProps } from 'react-native';
import { StyleSheet } from 'react-native';
import {
  Edges,
  SafeAreaView as SafeAreaContext,
} from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';

type SupportedChildren = React.ReactElement | React.ReactElement[] | null;
type SafeAreaViewChildren = SupportedChildren | SupportedChildren[];

type SafeAreaViewProps = ViewProps & {
  edges?: Edges;
  children: SafeAreaViewChildren;
};

const SafeAreaView = ({
  style,
  children,
  edges = ['top', 'bottom'],
  ...props
}: SafeAreaViewProps) => {
  const { colors } = useTheme();

  return (
    <SafeAreaContext
      style={[styles.container, { backgroundColor: colors.background }, style]}
      edges={edges}
      {...props}
    >
      {children}
    </SafeAreaContext>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default memo(SafeAreaView);
