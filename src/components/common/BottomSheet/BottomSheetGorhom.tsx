import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import React, { forwardRef, useCallback } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Box } from '../Layout/Box';
import { Text } from '../Text/Text';
import { colors } from '../../../theme/colors';


interface BottomSheetProps extends Partial<BottomSheetModalProps> {
  title?: string;
  showHeader?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  snapPoints?: (string | number)[];
  onClose?: () => void;
  /**
   * Called when the sheet snap index changes. Receives the new index (-1 for dismissed).
   */
  onChange?: (index: number) => void;
  children: React.ReactNode;
}

export const BottomSheetGorhom = forwardRef<BottomSheetModal, BottomSheetProps>(
  (
    {
      title,
      showHeader = true,
      containerStyle,
      contentStyle,
      snapPoints = ['50%'],
      onClose,
      children,
    ...props
    },
    ref
  ) => {

    const renderBackdrop = useCallback(
      (backdropProps: any) => (
        <BottomSheetBackdrop
          {...backdropProps}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    const renderContainer = useCallback(
      (containerProps: any) => (
        <>{containerProps.children}</>
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        containerComponent={renderContainer}
        // forward onChange to parent if provided
        onChange={props.onChange}
        enablePanDownToClose
        onDismiss={onClose}
        style={[{ zIndex: 1000 }, containerStyle]}
        {...props}
      >
        <BottomSheetView style={[{ flex: 1 }, contentStyle]}>
          <Box>
            {showHeader && (
              <Box
                justifyContent="center"
                alignItems="center"
                position="relative"
                borderBottomWidth={1}
                borderBottomColor={colors.divider}
                paddingBottom={16}
              >
                {title && (
                  <Text fontSize={16} fontWeight="semibold">
                    {title}
                  </Text>
                )}
              </Box>
            )}
            {children}
          </Box>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

