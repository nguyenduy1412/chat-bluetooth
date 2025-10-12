import React from 'react';
import type { KeyboardAvoidingViewProps } from 'react-native-keyboard-controller';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

type KeyboardViewProps = KeyboardAvoidingViewProps & {
  keyboardVerticalOffset?: number;
  scrollEnabled?: boolean;
  children: React.ReactElement[] | React.ReactElement;
  showsVerticalScrollIndicator?: boolean;
};

const KeyboardView = ({
  style,
  contentContainerStyle,
  scrollEnabled,
  keyboardVerticalOffset,
  children,
  showsVerticalScrollIndicator = false,
}: KeyboardViewProps) => (
  <KeyboardAwareScrollView
    keyboardShouldPersistTaps="handled"
    keyboardDismissMode="interactive"
    style={style}
    contentContainerStyle={contentContainerStyle}
    scrollEnabled={scrollEnabled}
    alwaysBounceVertical={false}
    extraKeyboardSpace={keyboardVerticalOffset}
    showsVerticalScrollIndicator={showsVerticalScrollIndicator}
  >
    {children}
  </KeyboardAwareScrollView>
);

export default KeyboardView;
