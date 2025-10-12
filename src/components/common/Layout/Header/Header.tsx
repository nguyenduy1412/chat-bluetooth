// import React from 'react';
// import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
// import { useRouter } from 'expo-router';
// import { useTheme } from '@react-navigation/native';
// import { ArrowLeft, X } from 'lucide-react-native';
// import { Box } from '@/components/common/Layout/Box';
// import { Text } from '@/components/common/Text/Text';
// import SafeAreaView from '../../SafeAreaView';
// import sizes from '@/theme/sizes';
// import { FontSize } from '@/theme/fonts';

// export type HeaderProps = {
//   title?: string;
//   showBackButton?: boolean;
//   backIcon?: 'arrow' | 'close';
//   onBackPress?: () => void;
//   right?: React.ReactNode[];
//   backgroundColor?: string;
//   hideBorder?: boolean;
//   titleColor?: string;
//   variant?: 'default' | 'modal' | 'transparent';
//   children?: React.ReactNode;
//   style?: ViewStyle;
// };

// export const Header: React.FC<HeaderProps> = ({
//   title,
//   showBackButton = true,
//   backIcon = 'arrow',
//   onBackPress,
//   right = [],
//   backgroundColor,
//   hideBorder = true,
//   titleColor,
//   variant = 'default',
//   children,
//   style,
// }) => {
//   const { colors } = useTheme();
//   const router = useRouter();

//   const handleBackPress = () => {
//     if (onBackPress) {
//       onBackPress();
//     } else {
//       router.back();
//     }
//   };

//   const renderBackIcon = () => {
//     switch (backIcon) {
//       case 'close':
//         return <X size={24} color={colors.text} strokeWidth={2} />;
//       case 'arrow':
//       default:
//         return <ArrowLeft size={20} color={colors.text} strokeWidth={2} />;
//     }
//   };

//   const renderRightComponents = () => {
//     return right.map((component, index) => (
//       <React.Fragment key={index}>{component}</React.Fragment>
//     ));
//   };

//   const getBackgroundColor = () => {
//     if (backgroundColor) return backgroundColor;

//     switch (variant) {
//       case 'transparent':
//         return 'transparent';
//       case 'modal':
//         return colors.surface;
//       case 'default':
//       default:
//         return colors.background;
//     }
//   };

//   const headerContent = (
//     <Box
//       paddingBottom={sizes.padding}
//       backgroundColor={getBackgroundColor()}
//       borderBottomWidth={!hideBorder ? StyleSheet.hairlineWidth : 0}
//       borderBottomColor={!hideBorder ? colors.divider : undefined}
//       style={style}
//     >
//       <Box
//         flexDirection="row"
//         alignItems="center"
//         justifyContent="space-between"
//         paddingLeft={sizes.padding}
//         paddingRight={sizes.padding}
//       >
//         <Box width={80} alignItems="flex-start">
//           {showBackButton && (
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={handleBackPress}
//               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//             >
//               {renderBackIcon()}
//             </TouchableOpacity>
//           )}
//         </Box>
//         <Box flex={1} alignItems="center">
//           {title && (
//             <Text
//               fontSize={FontSize.LARGE}
//               fontWeight="semibold"
//               color={titleColor || colors.text}
//               align="center"
//               numberOfLines={1}
//             >
//               {title}
//             </Text>
//           )}
//         </Box>
//         <Box
//           width={80}
//           flexDirection="row"
//           alignItems="center"
//           justifyContent="flex-end"
//           gap={sizes.base}
//         >
//           {renderRightComponents()}
//         </Box>
//       </Box>
//       {children && (
//         <Box paddingLeft={20} paddingRight={20} paddingTop={8}>
//           {children}
//         </Box>
//       )}
//     </Box>
//   );

//   if (variant === 'modal') {
//     return <SafeAreaView>{headerContent}</SafeAreaView>;
//   }

//   return headerContent;
// };

// const styles = StyleSheet.create({
//   backButton: {
//     padding: 4,
//   },
// });

// export default Header;
