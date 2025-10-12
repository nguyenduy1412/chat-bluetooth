import React from 'react';
import {
  Modal as RNModal,
  ModalProps as RNModalProps,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Box } from '../Layout/Box';
import { Text } from '../Text/Text';
import { X } from 'lucide-react-native';

const { height: screenHeight } = Dimensions.get('window');

interface ModalProps extends Partial<RNModalProps> {
  visible: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  onBackdropPress?: () => void;
  title?: string;
  hideCloseButton?: boolean;
  showHeader?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  onBackdropPress,
  title,
  hideCloseButton,
  showHeader = true,
  containerStyle,
  contentStyle,
  ...props
}) => {
  const { colors } = useTheme();

  const handleBackdropPress = () => {
    if (onBackdropPress) {
      onBackdropPress();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <RNModal visible={visible} transparent animationType="fade" {...props}>
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Box style={[styles.backdrop]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Box
              backgroundColor={colors.background}
              borderRadius={16}
              margin={20}
              maxHeight={screenHeight * 0.8}
              overflow="hidden"
              style={containerStyle}
            >
              <Box style={contentStyle}>
                {showHeader && (
                  <Box
                    justifyContent="center"
                    alignItems="center"
                    position="relative"
                    borderBottomWidth={1}
                    borderBottomColor={colors.divider}
                    padding={20}
                  >
                    {title && (
                      <Text fontSize={16} fontWeight="semibold">
                        {title}
                      </Text>
                    )}
                    {!hideCloseButton && (
                      <TouchableOpacity
                        onPress={onClose}
                        style={{
                          width: 28,
                          height: 28,
                          backgroundColor: colors.palette.grayScale[20],
                          borderRadius: 100,
                          justifyContent: 'center',
                          alignItems: 'center',
                          position: 'absolute',
                          alignSelf: 'center',
                          right: 20,
                        }}
                      >
                        <X size={16} strokeWidth={2.5} />
                      </TouchableOpacity>
                    )}
                  </Box>
                )}
                {children}
              </Box>
            </Box>
          </TouchableWithoutFeedback>
        </Box>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
});
