// import React, { useState, useRef, useEffect } from 'react';
// import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
// import type { MapPressEvent } from 'react-native-maps';
// import MapView, {
//   Marker,
//   PROVIDER_GOOGLE,
//   type Region,
// } from 'react-native-maps';
// import * as Location from 'expo-location';
// import { colors } from '@/theme/colors';
// import { Text } from './Text/Text';
// import { Box } from './Layout/Box';
// import { MapPin } from 'lucide-react-native';
// import { reverseGeocode, type LocationInfo } from '@/utils/geocoding';

// type MapProps = {
//   height?: number;
//   width?: string | number;
//   showMarker?: boolean;
//   markerCoordinate?: {
//     latitude: number;
//     longitude: number;
//   };
//   onLocationSelect?: (locationInfo: LocationInfo) => void;
//   showCurrentLocation?: boolean;
//   zoomEnabled?: boolean;
//   scrollEnabled?: boolean;
//   style?: any;
//   borderRadius?: number;
//   centerOnCoordinate?: {
//     latitude: number;
//     longitude: number;
//   };
// };

// const Map: React.FC<MapProps> = ({
//   height = 200,
//   width = '100%',
//   showMarker = true,
//   markerCoordinate,
//   onLocationSelect,
//   showCurrentLocation = true,
//   zoomEnabled = true,
//   scrollEnabled = true,
//   style,
//   borderRadius = 8,
//   centerOnCoordinate,
// }) => {
//   const mapRef = useRef<MapView>(null);
//   const [region, setRegion] = useState<Region | null>(null);
//   const [selectedCoordinate, setSelectedCoordinate] =
//     useState(markerCoordinate);
//   const [locationPermission, setLocationPermission] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (!markerCoordinate && !centerOnCoordinate) {
//       getCurrentLocation();
//     } else {
//       getLocationPermission();
//       setIsLoading(false);
//     }
//   }, [markerCoordinate, centerOnCoordinate]);

//   const getLocationPermission = async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       setLocationPermission(status === 'granted');
//     } catch (error) {
//       console.error('Error getting location permission:', error);
//       setLocationPermission(false);
//     }
//   };

//   useEffect(() => {
//     if (markerCoordinate) {
//       setSelectedCoordinate(markerCoordinate);
//       const newRegion = {
//         ...markerCoordinate,
//         latitudeDelta: 0.005,
//         longitudeDelta: 0.005,
//       };
//       setRegion(newRegion);

//       const timeoutId = setTimeout(() => {
//         if (mapRef.current) {
//           mapRef.current.animateToRegion(newRegion, 1000);
//         }
//       }, 100);

//       return () => clearTimeout(timeoutId);
//     }
//   }, [markerCoordinate]);

//   useEffect(() => {
//     if (centerOnCoordinate) {
//       const newRegion = {
//         ...centerOnCoordinate,
//         latitudeDelta: 0.005,
//         longitudeDelta: 0.005,
//       };
//       setRegion(newRegion);
//       setSelectedCoordinate(centerOnCoordinate);

//       setTimeout(() => {
//         if (mapRef.current) {
//           mapRef.current.animateToRegion(newRegion, 1000);
//         }
//       }, 100);
//     }
//   }, [centerOnCoordinate]);

//   const getCurrentLocation = async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         setLocationPermission(false);
//         setIsLoading(false);

//         return;
//       }

//       setLocationPermission(true);
//       const location = await Location.getCurrentPositionAsync({});
//       const { latitude, longitude } = location.coords;

//       if (!markerCoordinate && !centerOnCoordinate) {
//         const newRegion = {
//           latitude,
//           longitude,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         };
//         setRegion(newRegion);

//         if (showCurrentLocation) {
//           setSelectedCoordinate({ latitude, longitude });
//         }
//       }
//     } catch (error) {
//       console.error('Error getting location:', error);

//       setLocationPermission(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleMapPress = async (event: MapPressEvent) => {
//     if (onLocationSelect) {
//       const coordinate = event.nativeEvent.coordinate;
//       setSelectedCoordinate(coordinate);

//       const locationInfo = await reverseGeocode(
//         coordinate.latitude,
//         coordinate.longitude
//       );

//       if (locationInfo) {
//         onLocationSelect(locationInfo);
//       }
//     }
//   };

//   if (isLoading) {
//     return (
//       <Box
//         style={[styles.container, { height, width, borderRadius }, style]}
//         alignItems="center"
//         justifyContent="center"
//         backgroundColor="#E8F5E8"
//       >
//         <MapPin size={40} color={colors.limeGreen} />
//         <Text fontSize={14} color={colors.limeGreen} style={styles.marginTop}>
//           Loading map...
//         </Text>
//       </Box>
//     );
//   }

//   if (!locationPermission) {
//     return (
//       <Box
//         style={[styles.container, { height, width, borderRadius }, style]}
//         alignItems="center"
//         justifyContent="center"
//         backgroundColor="#E8F5E8"
//       >
//         <MapPin size={40} color={colors.limeGreen} />
//         <Text
//           fontSize={14}
//           color={colors.limeGreen}
//           style={[styles.marginTop, styles.centerText]}
//         >
//           Location permission required{'\n'}to display map
//         </Text>
//       </Box>
//     );
//   }

//   if (!region) {
//     return (
//       <Box
//         style={[styles.container, { height, width, borderRadius }, style]}
//         alignItems="center"
//         justifyContent="center"
//         backgroundColor="#E8F5E8"
//       >
//         <MapPin size={40} color={colors.limeGreen} />
//         <Text fontSize={14} color={colors.limeGreen} style={styles.marginTop}>
//           Unable to load map
//         </Text>
//       </Box>
//     );
//   }

//   return (
//     <View style={[styles.container, { height, width, borderRadius }, style]}>
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         provider={PROVIDER_GOOGLE}
//         region={region}
//         onRegionChangeComplete={newRegion => setRegion(newRegion)}
//         onPress={handleMapPress}
//         zoomEnabled={zoomEnabled}
//         scrollEnabled={scrollEnabled}
//         showsUserLocation={showCurrentLocation && locationPermission}
//         showsMyLocationButton={false}
//         mapType="standard"
//       >
//         {showMarker && selectedCoordinate && (
//           <Marker
//             coordinate={selectedCoordinate}
//             draggable
//             onDragEnd={async e => {
//               const newCoordinate = e.nativeEvent.coordinate;
//               setSelectedCoordinate(newCoordinate);
//               if (onLocationSelect) {
//                 const locationInfo = await reverseGeocode(
//                   newCoordinate.latitude,
//                   newCoordinate.longitude
//                 );

//                 if (locationInfo) {
//                   onLocationSelect(locationInfo);
//                 }
//               }
//             }}
//           />
//         )}
//       </MapView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     overflow: 'hidden',
//   },
//   map: {
//     flex: 1,
//   },
//   marginTop: {
//     marginTop: 8,
//   },
//   centerText: {
//     textAlign: 'center',
//   },
// });

// export default Map;
