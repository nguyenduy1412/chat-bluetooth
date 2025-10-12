// import React from 'react';
// import type { ViewStyle } from 'react-native';
// import { TouchableOpacity, StyleSheet } from 'react-native';
// import { useRouter } from 'expo-router';
// import { ArrowLeft } from 'lucide-react-native';
// import { useTheme } from '@react-navigation/native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { Box } from '@/components/common/Layout/Box';
// import sizes from '@/theme/sizes';

// interface BackButtonProps {
//   onPress?: () => void;
//   size?: number;
//   iconColor?: string;
//   backgroundColor?: string;
//   style?: ViewStyle;
//   position?: 'absolute' | 'relative';
//   top?: number;
//   left?: number;
// }

// export default function BackButton({
//   onPress,
//   size = 20,
//   iconColor,
//   backgroundColor = 'rgba(255,255,255,0.9)',
//   style,
//   position = 'absolute',
//   top,
//   left = 16,
// }: BackButtonProps) {
//   const router = useRouter();
//   const { colors } = useTheme();
//   const { top: safeAreaTop } = useSafeAreaInsets();
//   const buttonStyle = [
//     styles.backButton,
//     {
//       position,
//       top:
//         top ??
//         (position === 'absolute' ? safeAreaTop + sizes.padding : undefined),
//       left: position === 'absolute' ? left : undefined,
//     },
//     style,
//   ];

//   const handlePress = () => {
//     if (onPress) {
//       onPress();
//     } else {
//       router.back();
//     }
//   };

//   return (
//     <TouchableOpacity onPress={handlePress} style={buttonStyle}>
//       <Box
//         backgroundColor={backgroundColor}
//         width={40}
//         height={40}
//         borderRadius={999}
//         justifyContent="center"
//         alignItems="center"
//       >
//         <ArrowLeft size={size} color={iconColor || colors.text} />
//       </Box>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   backButton: {
//     zIndex: 10,
//   },
// });
