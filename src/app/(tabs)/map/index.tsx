import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {Box} from '../../../components/common/Layout/Box';
import Mapbox, {Camera} from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import {LocateFixed} from 'lucide-react-native';
import {colors} from '../../../theme/colors';

Mapbox.setAccessToken(
  'pk.eyJ1IjoiZHV5MTQxMiIsImEiOiJjbWd0OW5wNDIwMjJyMm5uYWowdzVsMzRiIn0.GBkouLsk82Z-OEdglK-I_Q',
);

const DEFAULT_HANOI_CENTER: [number, number] = [105.85, 21.03];

const MapScreen: React.FC = () => {
  const [location, setLocation] =
    useState<[number, number]>(DEFAULT_HANOI_CENTER);
  const [cameraLocation, setCameraLocation] =
    useState<[number, number]>(DEFAULT_HANOI_CENTER);
  const [cameraKey, setCameraKey] = useState(0);
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
        }
        Geolocation.getCurrentPosition(
          pos => {
            const {longitude, latitude} = pos.coords;
            setLocation([longitude, latitude]);
            setCameraLocation([longitude, latitude]);
          },
          err => {},
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      } catch (e) {}
    };
    requestLocationPermission();
  }, []);
  const goToCurrentLocation = () => {
    setCameraKey(prev => prev + 1);
  };
  return (
    <Box flex={1}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        logoEnabled={false}
        compassEnabled={true}
        compassPosition={{
          top: 30,
          left: 10,
        }}
        scaleBarEnabled={false}>
        <Camera
          key={cameraKey}
          zoomLevel={18}
          centerCoordinate={cameraLocation}
          animationMode={'flyTo'}
          animationDuration={2000}
        />
        <Mapbox.UserLocation
          visible={true}
          showsUserHeadingIndicator={true}
          androidRenderMode="normal"
        />
      </Mapbox.MapView>
      <TouchableOpacity
        style={styles.locationFixed}
        onPress={goToCurrentLocation}>
        <LocateFixed size={30} />
      </TouchableOpacity>
    </Box>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  map: {flex: 1},
  locationFixed: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 100,
    elevation: 5,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
