import { PermissionsAndroid, Platform } from "react-native";


export const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      if (Platform.Version >= 31) {
        // Android 12+
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return Object.values(granted).every(
          (v) => v === PermissionsAndroid.RESULTS.GRANTED
        );
      } else if (Platform.Version >= 29) {
        // Android 10-11
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        return Object.values(granted).every(
          (v) => v === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // Android 9 trở xuống
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        return Object.values(granted).every(
          (v) => v === PermissionsAndroid.RESULTS.GRANTED
        );
      }
    }
    return true;
  };