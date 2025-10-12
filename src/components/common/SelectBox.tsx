import React, { useCallback, useRef } from 'react';
import { Box } from './Layout/Box';
import { Text } from './Text/Text';
import type { TextStyle, ViewStyle } from 'react-native';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import isEmpty from 'lodash/isEmpty';

import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowDown } from '../icons';

const { height } = Dimensions.get('window');
const BOTTOMSHEET_HEADER_HEIGHT = 60;

export type SelectBoxProps<T> = {
  options: T[];
  value: string | number | null | undefined;
  onSelect: (selected: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string | number;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  placeholder?: string;
  label?: string;
  isRequired?: boolean;
  error?: string;
  hasArrow?: boolean;
};

const SelectBox = <T,>({
  options,
  value,
  onSelect,
  getLabel,
  getValue,
  style,
  containerStyle,
  textStyle,
  placeholder = 'Select',
  label,
  isRequired,
  error,
  hasArrow = true,
}: SelectBoxProps<T>) => {
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  return (
    <Box gap={4} style={containerStyle}>
      {label && (
        <Box flexDirection="row" gap={2}>
          <Text fontSize={14} fontWeight="normal">
            {label}
          </Text>
          {isRequired && (
            <Text fontSize={14} fontWeight="normal">
              *
            </Text>
          )}
        </Box>
      )}

      <TouchableOpacity
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: colors.palette.grayScale[10],
            borderRadius: 8,
          },
          style,
        ]}
        activeOpacity={0.7}
        onPress={() => {
          bottomSheetRef.current?.present();
        }}
      >
        <Text
          fontSize={14}
          fontWeight={value ? 'medium' : 'normal'}
          color={value ? colors.text : colors.textTertiary}
          style={textStyle}
        >
          {options?.find(option => getValue(option) === value)
            ? getLabel(options.find(option => getValue(option) === value) as T)
            : placeholder}
        </Text>
        {hasArrow && <ArrowDown />}
      </TouchableOpacity>
      {!isEmpty(error) && <Text color={colors.error}>{error}</Text>}

      <BottomSheet
        ref={bottomSheetRef}
        // title={placeholder}
        snapPoints={['50%']}
        enableDynamicSizing={false}
      >
        <ScrollView
          style={{ maxHeight: height / 2 - BOTTOMSHEET_HEADER_HEIGHT }}
          contentContainerStyle={{ padding: 16, paddingBottom: bottom, gap: 8 }}
        >
          {options?.map((item, index) => (
            <TouchableOpacity
              key={String(getValue(item)) + index}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor:
                  getValue(item) === value
                    ? colors.primary + '22'
                    : 'transparent',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onPress={() => {
                onSelect(item);
                bottomSheetRef.current?.dismiss();
              }}
            >
              <Text
                fontSize={16}
                fontWeight={getValue(item) === value ? 'semibold' : 'normal'}
                color={getValue(item) === value ? colors.primary : colors.text}
              >
                {getLabel(item)}
              </Text>
              {getValue(item) === value && (
                <Box
                  width={18}
                  height={18}
                  borderRadius={9}
                  backgroundColor={colors.primary}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Box
                    width={10}
                    height={10}
                    borderRadius={5}
                    backgroundColor={colors.onPrimary}
                  />
                </Box>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheet>
    </Box>
  );
};

export default SelectBox;
