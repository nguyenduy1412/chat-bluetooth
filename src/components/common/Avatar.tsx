// import { Alert, Image, StyleSheet, Text, View } from 'react-native'
// import React, { useCallback, useEffect, useState } from 'react'
// import { Box } from './Layout/Box'
// import { Camera } from 'lucide-react-native'
// import { useTheme } from '@react-navigation/native'
// import { useImagePickerPermission } from '@/hooks/usePermissions'
// import * as ImagePicker from 'expo-image-picker';
// import { translate } from '@/i18n/translate';
// interface AvatarProps {
//   quality?: number;
//   aspect?: [number, number];
//   allowsEditing ?: boolean,
//   uri?: string | null;
//   onImageSelected?: (uri: string) => void;
// }
// interface ImagePickerResult {
//   uri: string;
//   width: number;
//   height: number;
//   type?: string;
//   fileSize?: number;
// }
// const Avatar: React.FC<AvatarProps> = ({
//   quality = 0.8,
//   aspect = [16, 9],
//   allowsEditing = true,
//   uri=null,
//   onImageSelected,
  
// }) => {
//   const { colors } = useTheme();
//   const [image,setImage] = useState<string | null>(uri);
//   const {
//     requestCameraPermissionIfNeeded,
//     requestMediaLibraryPermissionIfNeeded,
//   } = useImagePickerPermission();

//   const showImagePickerOptions = () => {
//     Alert.alert(
//       translate('personalInformation.selectImage'),
//       translate('personalInformation.chooseAnOptionToSelectAnImage'),
//       [
//         {
//           text: translate('personalInformation.camera'),
//           onPress: openCamera,
//         },
//         {
//           text: translate('personalInformation.gallery'),
//           onPress: openImageLibrary,
//         },
//         {
//           text: translate('personalInformation.cancel'),
//           style: 'cancel',
//         },
//       ],
//       { cancelable: true }
//     );
//   };

//   const openCamera = async () => {
//     const hasPermission = await requestCameraPermissionIfNeeded();
//     if (!hasPermission) return;
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
//         onImageSelected?.(imageResult.uri);
//         setImage(imageResult.uri);
//       }
//     } catch (error) {
//       console.error('Error opening camera:', error);
//       Alert.alert('Error', 'Failed to open camera');
//     }
//   };

//   const openImageLibrary = async () => {
//     const hasPermission = await requestMediaLibraryPermissionIfNeeded();
//     if (!hasPermission) return;
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
//         onImageSelected?.(imageResult.uri);
//         setImage(imageResult.uri);
//       }
//     } catch (error) {
//       console.error('Error opening image library:', error);
//       Alert.alert('Error', 'Failed to open image library');
//     }
//   };
//   return (
//     <Box alignItems="center">
//       <Box>
//         <Image
//           source={{ uri: !image ? 'https://picsum.photos/200' : image }}
//           style={styles.avatar}
//         />
//         <Box w={30} h={30} backgroundColor={colors.primary} borderRadius={15} justifyContent="center" alignItems="center" position='absolute' bottom={0} right={0} onPress={showImagePickerOptions} >
//           <Camera color={colors.onPrimary} size={18} />
//         </Box>
//       </Box>
//     </Box>
//   )
// }

// export default Avatar

// const styles = StyleSheet.create({
//   avatar: {
//     width: 80,
//     height: 80,
//     borderRadius: 50,
//     borderWidth: 2,
//     borderColor: '#fff'
//   },
// })