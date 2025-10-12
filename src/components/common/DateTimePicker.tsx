// import React, { useCallback, useMemo, useRef } from 'react';
// import { Box } from './Layout/Box';
// import { Text } from './Text/Text';
// import type { ViewStyle } from 'react-native';
// import { Keyboard, TouchableOpacity } from 'react-native';
// import { useTheme } from '@react-navigation/native';
// import isEmpty from 'lodash/isEmpty';
// import { ArrowDown } from '@/components/icons';
// import { BottomSheetModal } from '@gorhom/bottom-sheet';
// import { BottomSheet } from './BottomSheet';
// import RNDateTimePicker, { DateType } from 'react-native-ui-datepicker';
// import dayjs from 'dayjs';
// import { DATE_FORMAT } from '@/constant/date';

// export type DateTimePickerProps = {
//   value: DateType;
//   onSelect: (date: DateType) => void;
//   style?: ViewStyle;
//   containerStyle?: ViewStyle;
//   placeholder?: string;
//   label?: string;
//   isRequired?: boolean;
//   error?: string;
//   hasArrow?: boolean;
//   dateFormat?: string;
// };

// const DateTimePicker = ({
//   value,
//   onSelect,
//   style,
//   containerStyle,
//   placeholder = 'Select',
//   label,
//   isRequired,
//   error,
//   hasArrow = true,
//   dateFormat = DATE_FORMAT,
// }: DateTimePickerProps) => {
//   const { colors } = useTheme();
//   const bottomSheetRef = useRef<BottomSheetModal>(null);
//   const date = useMemo(() => {
//     if (!value) return undefined;

//     const date = dayjs(value);
//     if (!date.isValid()) {
//       return undefined;
//     }

//     return date.toDate();
//   }, [value]);

//   const handleSelectDate = useCallback(
//     ({ date }: { date: DateType }) => {
//       if (date) {
//         onSelect(date);
//         bottomSheetRef.current?.dismiss();
//       }
//     },
//     [onSelect]
//   );

//   return (
//     <Box gap={4} style={containerStyle}>
//       {label && (
//         <Box flexDirection="row" gap={2}>
//           {isRequired && (
//             <Text fontSize={14} fontWeight="normal">
//               *
//             </Text>
//           )}
//           <Text fontSize={14} fontWeight="normal">
//             {label}
//           </Text>
//         </Box>
//       )}

//       <TouchableOpacity
//         style={[
//           {
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             paddingVertical: 8,
//             paddingHorizontal: 14,
//             borderWidth: 1,
//             borderColor: colors.palette.grayScale[10],
//             borderRadius: 8,
//           },
//           style,
//         ]}
//         activeOpacity={0.7}
//         onPress={() => {
//           bottomSheetRef.current?.present();
//           Keyboard.dismiss();
//         }}
//       >
//         <Text
//           fontSize={14}
//           fontWeight={'normal'}
//           color={value ? colors.text : colors.textTertiary}
//         >
//           {value && dayjs(value).isValid()
//             ? dayjs(value).format(dateFormat)
//             : placeholder}
//         </Text>
//         {hasArrow && <ArrowDown />}
//       </TouchableOpacity>
//       {!isEmpty(error) && <Text color={colors.error}>{error}</Text>}

//       <BottomSheet ref={bottomSheetRef} title={placeholder}>
//         <RNDateTimePicker
//           mode="single"
//           date={date}
//           onChange={handleSelectDate}
//         />
//       </BottomSheet>
//     </Box>
//   );
// };

// export default DateTimePicker;
