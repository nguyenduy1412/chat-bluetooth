import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { forwardRef, memo, useEffect, useRef, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import type { LayoutChangeEvent } from 'react-native';
import { StyleSheet, TextInput } from 'react-native';
import { mask as rnmtMask, unMask as rnmtUnMask } from 'react-native-mask-text';


import { useTheme } from '@react-navigation/native';
import { Eye, EyeClosed } from 'lucide-react-native';
import { TextFieldProps } from './types';
import { formatPhoneNumber } from '../../../utils/phoneFormat';
import { Box } from '../Layout/Box';
import { getFontFamily, Text } from '../Text/Text';
import { colors } from '../../../theme/colors';

const TextField = forwardRef<any, TextFieldProps>(
  (
    {
      label,
      error,
      hint,
      left,
      right,
      onChange,
      inputStyle,
      required = false,
      editable = true,
      disabled = false,
      onFocus: onFocusProp,
      onBlur: onBlurProp,
      onLayout: onLayoutProp,
      isOptional,
      onPressIconRight,
      onPressIconLeft,
      innerInputWrapper,
      inputErrorStyle,
      containerStyle,
      value,
      mask,
      borderBottomColor,
      iconRightStyle,
      labelColor,
      useBottomSheetInput,
      toolTip,
      toolTipStyle,
      onPressToolTip,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [placeholder, setPlaceholder] = useState<string>('');
    const InputComponent = useBottomSheetInput
      ? BottomSheetTextInput
      : TextInput;

    // Password show/hide logic
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = !!props.isPassword;

    const handleOnChangeText = (text: string) => {
      let formatted = text;
      if (props.phone) {
        formatted = formatPhoneNumber(text);
      }
      if (typeof onChange === 'function') {
        onChange(
          formatted,
          mask ? rnmtUnMask(formatted, mask.type) : undefined
        );
      }
      if (typeof props.onChangeText === 'function') {
        props.onChangeText(formatted);
      }
    };

    const onFocus = () => {
      onFocusProp?.();
      setIsFocused(true);
    };

    const onBlur = () => {
      onBlurProp?.();
      setIsFocused(false);
    };

    const onLayout = (e: LayoutChangeEvent) => {
      onLayoutProp?.(e);
    };
    const placeholderTimer = useRef<number | undefined>(undefined);

    let displayedValue = value?.toString();
    if (props.phone && value) {
      displayedValue = formatPhoneNumber(value);
    } else if (mask && value) {
      displayedValue = rnmtMask(value, mask.pattern, mask.type, mask.options);
    }

    useEffect(() => {
      if (!isFocused) {
        const placeholderProp = props.placeholder;
        if (placeholderProp) {
          setPlaceholder(placeholderProp);
        }
      } else {
        setPlaceholder('');
      }

      return () => {
        setPlaceholder('');
      };
    }, [isFocused, label, props.placeholder]);

    return (
      <Box
        mb={16}
        opacity={disabled ? 0.7 : 1}
        style={[styles.inputContainerStyle, containerStyle]}
      >
        <Box flexDirection={'row'} alignItems="center" mb={6}>
          <Text
            fontSize={14}
            color={labelColor ? labelColor : colors.text}
          >
            {required ? '* ' : ''}
            {label}
            {isOptional && (
              <Text color={colors.textSecondary}>{' (optional)'}</Text>
            )}
          </Text>
          {toolTip && (
            <Box onPress={onPressToolTip} style={toolTipStyle}>
              {React.isValidElement(toolTip)
                ? toolTip
                : React.createElement(toolTip)}
            </Box>
          )}
        </Box>
        <Box
          flexDirection={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
          w={'100%'}
          mb={!isEmpty(hint) || !isEmpty(error) ? 12 : 0}
          px={16}
          border={1}
          rounded={6}
          borderColor={
            error
              ? colors.error
              : borderBottomColor ||
                (isFocused ? colors.primary : colors.grayScale[10])
          }
        >
          {left && (
            <Box onPress={onPressIconLeft}>
              {React.isValidElement(left) ? left : React.createElement(left)}
            </Box>
          )}

          <InputComponent
            {...props}
            ref={ref}
            autoCorrect={false}
            selectionColor={props?.selectionColor}
            placeholderTextColor={props?.placeholderTextColor}
            value={displayedValue ?? ''}
            placeholder={placeholder}
            onLayout={onLayout}
            onChangeText={handleOnChangeText}
            onChange={props.onChangeEvent}
            onFocus={onFocus}
            onBlur={onBlur}
            style={[
              styles.inputText,
              {
                color: inputStyle?.color ?? colors.text,
              },
              inputErrorStyle,
              inputStyle,
            ]}
            editable={!disabled && editable}
            secureTextEntry={isPasswordField ? !showPassword : false}
            keyboardType={props.phone ? 'phone-pad' : props.keyboardType}
            maxLength={props.phone ? 14 : props.maxLength}
          />

          {right ? (
            <Box onPress={onPressIconRight} style={iconRightStyle}>
              {React.isValidElement(right) ? right : React.createElement(right)}
            </Box>
          ) : isPasswordField ? (
            <Box onPress={() => setShowPassword(prev => !prev)}>
              {showPassword ? (
                <Eye size={16} color={colors.text} />
              ) : (
                <EyeClosed size={16} color={colors.text} />
              )}
            </Box>
          ) : null}
        </Box>
        {(!isEmpty(hint) || !isEmpty(error)) && (
          <Text color={colors.error}>{error || hint}</Text>
        )}
      </Box>
    );
  }
);

TextField.displayName = 'TextField';

export default memo(TextField);

const styles = StyleSheet.create({
  inputContainerStyle: {},
  inputText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'medium',
    fontFamily: getFontFamily(),
    paddingHorizontal: 0, // fix padding in android input
    minHeight: 36,
    padding: 8,
  },
  inputStyleError: {
    fontSize: 16,
    lineHeight: 24,
  },
  mgBottom: {
    marginBottom: 12,
  },
});
