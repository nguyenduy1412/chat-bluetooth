// import React, { useState, useEffect } from 'react';
// import { StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import { X, Image as ImageIcon } from 'lucide-react-native';
// import { useTheme } from '@react-navigation/native';
// import { Box } from '../Layout/Box';
// import { Text } from '../Text/Text';
// import { colors } from '@/theme/colors';
// import { useImagePickerPermission } from '@/hooks/usePermissions';
// import { Trash } from '@/components/icons';

// interface ImagePickerProps {
//   onImageSelected?: (imageUri: string) => void;
//   onImageRemoved?: () => void;
//   placeholder?: string;
//   height?: number;
//   width?: string | number;
//   borderRadius?: number;
//   allowsEditing?: boolean;
//   quality?: number;
//   aspect?: [number, number];
//   initialImage?: string;
//   showRemoveButton?: boolean;
//   screenName?: string;
// }

// interface ImagePickerResult {
//   uri: string;
//   width: number;
//   height: number;
//   type?: string;
//   fileSize?: number;
// }

// const CustomImagePicker: React.FC<ImagePickerProps> = ({
//   onImageSelected,
//   onImageRemoved,
//   placeholder = 'Upload image',
//   height = 120,
//   width = '100%',
//   borderRadius = 8,
//   allowsEditing = true,
//   quality = 0.8,
//   aspect = [16, 9],
//   initialImage,
//   showRemoveButton = true,
//   screenName = 'Event',
// }) => {
//   const theme = useTheme();
//   const [selectedImage, setSelectedImage] = useState<string | null>(
//     initialImage || null
//   );
//   const [isLoading, setIsLoading] = useState(false);

//   // Sync với initialImage prop khi nó thay đổi
//   useEffect(() => {
//     setSelectedImage(initialImage || null);
//   }, [initialImage]);

//   const {
//     requestCameraPermissionIfNeeded,
//     requestMediaLibraryPermissionIfNeeded,
//   } = useImagePickerPermission();

//   const showImagePickerOptions = () => {
//     Alert.alert(
//       'Select Image',
//       'Choose an option to select an image',
//       [
//         {
//           text: 'Camera',
//           onPress: openCamera,
//         },
//         {
//           text: 'Gallery',
//           onPress: openImageLibrary,
//         },
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//       ],
//       { cancelable: true }
//     );
//   };

//   const openCamera = async () => {
//     const hasPermission = await requestCameraPermissionIfNeeded();
//     if (!hasPermission) return;

//     setIsLoading(true);
//     try {
//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing,
//         aspect,
//         quality,
//       });

//       if (!result.canceled && result.assets && result.assets[0]) {
//         const imageResult: ImagePickerResult = {
//           uri: result.assets[0].uri,
//           width: result.assets[0].width,
//           height: result.assets[0].height,
//           type: result.assets[0].type,
//           fileSize: result.assets[0].fileSize,
//         };

//         setSelectedImage(imageResult.uri);
//         onImageSelected?.(imageResult.uri);
//       }
//     } catch (error) {
//       console.error('Error opening camera:', error);
//       Alert.alert('Error', 'Failed to open camera');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const openImageLibrary = async () => {
//     const hasPermission = await requestMediaLibraryPermissionIfNeeded();
//     if (!hasPermission) return;

//     setIsLoading(true);
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing,
//         aspect,
//         quality,
//       });

//       if (!result.canceled && result.assets && result.assets[0]) {
//         const imageResult: ImagePickerResult = {
//           uri: result.assets[0].uri,
//           width: result.assets[0].width,
//           height: result.assets[0].height,
//           type: result.assets[0].type,
//           fileSize: result.assets[0].fileSize,
//         };

//         setSelectedImage(imageResult.uri);
//         onImageSelected?.(imageResult.uri);
//       }
//     } catch (error) {
//       console.error('Error opening image library:', error);
//       Alert.alert('Error', 'Failed to open image library');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const removeImage = () => {
//     setSelectedImage(null);
//     onImageRemoved?.();
//   };

//   const renderPlaceholder = () => (
//     <TouchableOpacity
//       style={[
//         styles.uploadContainer,
//         { height, borderRadius },
//         typeof width === 'string' ? styles.fullWidth : { width },
//       ]}
//       onPress={showImagePickerOptions}
//       disabled={isLoading}
//     >
//       <Box
//         height={height}
//         borderWidth={2}
//         borderColor={theme.colors.border}
//         borderStyle="dashed"
//         borderRadius={borderRadius}
//         alignItems="center"
//         justifyContent="center"
//         backgroundColor={theme.colors.card}
//         style={styles.fullWidth}
//       >
//         {isLoading ? (
//           <Text fontSize={14} color={theme.colors.text}>
//             Loading...
//           </Text>
//         ) : (
//           <Text
//             fontSize={16}
//             color={theme.colors.text}
//             style={[styles.marginTop, styles.underline]}
//           >
//             {placeholder}
//           </Text>
//         )}
//       </Box>
//     </TouchableOpacity>
//   );

//   const renderSelectedImage = () => (
//     <Box
//       style={[
//         styles.imageContainer,
//         { height, borderRadius },
//         typeof width === 'string' ? styles.fullWidth : { width },
//       ]}
//     >
//       <Image
//         source={{ uri: selectedImage! }}
//         style={[styles.selectedImage, { borderRadius }]}
//         resizeMode="cover"
//       />

//       {/* Overlay with actions */}
//       <Box style={styles.imageOverlay}>
//         <Box flexDirection="row" style={styles.actionButtons}>
//           {/* Change Image Button */}
//           {screenName === 'Event' && <TouchableOpacity
//             style={[styles.actionButton, styles.changeButton]}
//             onPress={showImagePickerOptions}
//           >
//             <ImageIcon size={16} color={colors.white || '#FFFFFF'} />
//           </TouchableOpacity>}
            
//           {/* Remove Image Button */}
//           {showRemoveButton && (
//             <TouchableOpacity
//               style={[styles.actionButton, styles.removeButton,screenName === 'Feedback' && {backgroundColor: colors.grayScale[10]}]}
//               onPress={removeImage}
//             >
//               {screenName === 'Event' ? (
//                 <X size={16} color={colors.white || '#FFFFFF'} />
//               ) : (<Trash size={18} />)}
//             </TouchableOpacity>
//           )}
//         </Box>
//       </Box>
//     </Box>
//   );

//   return (
//     <Box>{selectedImage ? renderSelectedImage() : renderPlaceholder()}</Box>
//   );
// };

// const styles = StyleSheet.create({
//   uploadContainer: {
//     borderRadius: 8,
//   },
//   fullWidth: {
//     width: '100%',
//   },
//   imageContainer: {
//     position: 'relative',
//     overflow: 'hidden',
//   },
//   selectedImage: {
//     width: '100%',
//     height: '100%',
//   },
//   imageOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.3)',
//     justifyContent: 'space-between',
//     padding: 8,
//   },
//   actionButtons: {
//     alignSelf: 'flex-end',
//     gap: 8,
//   },
//   actionButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: colors.black || '#000000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   changeButton: {
//     backgroundColor: colors.limeGreen,
//   },
//   removeButton: {
//     backgroundColor: colors.red || '#FF4444',
//   },
//   marginTop: {
//     marginTop: 8,
//   },
//   underline: {
//     textDecorationLine: 'underline',
//   },
//   hint: {
//     opacity: 0.6,
//     textAlign: 'center',
//     marginTop: 4,
//   },
// });

// export default CustomImagePicker;
