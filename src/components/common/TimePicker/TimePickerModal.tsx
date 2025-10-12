import React from 'react';
import { Modal, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { Box } from '../Layout/Box';
import { Text } from '../Text/Text';
import WheelPicker from '../WheelPicker';

import sizes from '../../../theme/sizes';
import Button from '../Button/Button';

export type TimePickerModalProps = {
  visible: boolean;
  tempHour: number;
  tempMinute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

const TimePickerModal = ({
  visible,
  tempHour,
  tempMinute,
  onHourChange,
  onMinuteChange,
  onConfirm,
  onCancel,
}: TimePickerModalProps) => {
  const { colors } = useTheme();

  const hours = Array.from({ length: 24 }, (_, hour) =>
    hour.toString().padStart(2, '0')
  );
  const minutes = Array.from({ length: 60 }, (_, minute) =>
    minute.toString().padStart(2, '0')
  );

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Box
        style={StyleSheet.absoluteFill}
        backgroundColor={colors.palette.blackOverlay}
      />

      <Box
        paddingX={sizes.padding}
        paddingBottom={sizes.padding}
        justifyContent="center"
        flex={1}
      >
        <Box
          backgroundColor={colors.background}
          borderRadius={sizes.radius}
          padding={sizes.padding}
        >
          <Box flexDirection="row" justifyContent="center" marginBottom={24}>
            <Box flex={1} alignItems="center">
              <WheelPicker
                data={hours}
                selectedIndex={tempHour}
                onIndexChange={onHourChange}
                style={styles.wheelPicker}
              />
            </Box>
            <Box width={20} justifyContent="center" alignItems="center">
              <Text fontSize={24} fontWeight="bold" color={colors.text}>
                :
              </Text>
            </Box>
            <Box flex={1} alignItems="center">
              <WheelPicker
                data={minutes}
                selectedIndex={tempMinute}
                onIndexChange={onMinuteChange}
                style={styles.wheelPicker}
              />
            </Box>
          </Box>

          <Box flexDirection="row" gap={12}>
            {/* <Button
              text="Cancel"
              variant="tertiary"
              style={styles.button}
              onPress={onCancel}
            />
            <Button
              text="Confirm"
              variant="primary"
              style={styles.button}
              onPress={onConfirm}
            /> */}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

const styles = StyleSheet.create({
  wheelPicker: {
    width: 80,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 16,
  },
});

export default TimePickerModal;
