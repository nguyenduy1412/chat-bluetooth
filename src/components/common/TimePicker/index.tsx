import React, { useCallback, useState } from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import isEmpty from 'lodash/isEmpty';
import dayjs from 'dayjs';
import { Box } from '../Layout/Box';
import { Text } from '../Text/Text';
import TimePickerModal from './TimePickerModal';
import { FontSize } from '../../../theme/fonts';
import TimerIcon from '../../icons/Timer';


export type TimePickerProps = {
  value: Date | null;
  onSelect: (time: Date | null) => void;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  placeholder?: string;
  label?: string;
  isRequired?: boolean;
  error?: string;
  timeFormat?: string;
  disabled?: boolean;
};

const TimePicker = ({
  value,
  onSelect,
  style,
  containerStyle,
  placeholder = 'Select time',
  label,
  isRequired,
  error,
  timeFormat = 'HH:mm',
  disabled = false,
}: TimePickerProps) => {
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const selectedHour = value ? dayjs(value).hour() : 0;
  const selectedMinute = value ? dayjs(value).minute() : 0;
  const [tempHour, setTempHour] = useState(selectedHour);
  const [tempMinute, setTempMinute] = useState(selectedMinute);

  const handleConfirm = useCallback(() => {
    const newTime = dayjs()
      .hour(tempHour)
      .minute(tempMinute)
      .second(0)
      .millisecond(0)
      .toDate();
    onSelect(newTime);
    setShowModal(false);
  }, [tempHour, tempMinute, onSelect]);

  const handleCancel = useCallback(() => {
    setTempHour(selectedHour);
    setTempMinute(selectedMinute);
    setShowModal(false);
  }, [selectedHour, selectedMinute]);

  const handlePress = () => {
    if (!disabled) {
      setTempHour(selectedHour);
      setTempMinute(selectedMinute);
      setShowModal(true);
    }
  };

  return (
    <Box gap={4} style={containerStyle}>
      {label && (
        <Box flexDirection="row" gap={2}>
          {isRequired && (
            <Text fontSize={FontSize.MEDIUM} fontWeight="normal">
              *
            </Text>
          )}
          <Text fontSize={FontSize.MEDIUM} fontWeight="normal">
            {label}
          </Text>
        </Box>
      )}

      <TouchableOpacity
        style={[
          styles.inputContainer,
          {
            borderColor: error ? colors.error : colors.palette.grayScale[10],
            backgroundColor: disabled
              ? colors.palette.grayScale[4]
              : colors.background,
          },
          disabled && styles.disabled,
          style,
        ]}
        activeOpacity={disabled ? 1 : 0.7}
        onPress={handlePress}
        disabled={disabled}
      >
        <Text
          fontSize={FontSize.MEDIUM}
          fontWeight={'normal'}
          color={value ? colors.text : colors.textTertiary}
        >
          {value ? dayjs(value).format(timeFormat) : placeholder}
        </Text>
        <TimerIcon />
      </TouchableOpacity>

      {!isEmpty(error) && (
        <Text fontSize={FontSize.SMALL} color={colors.error}>
          {error}
        </Text>
      )}

      <TimePickerModal
        visible={showModal}
        tempHour={tempHour}
        tempMinute={tempMinute}
        onHourChange={setTempHour}
        onMinuteChange={setTempMinute}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default TimePicker;
