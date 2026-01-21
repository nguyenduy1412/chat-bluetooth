import {Alert} from 'react-native';
import BluetoothModule from '../../../assets/managers/BluetoothModule';
import {useCallback, useState} from 'react';
import {BluetoothDevice, ConnectedDevice} from '../types';
import {useUpdateUser} from '@/features/auth/hooks/useUpdateUser';
import {userStore} from '@/store/userStore';
export const useBluetooth = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>(
    [],
  );
  const {user} = userStore();
  const {mutateAsync: updateUser, isPending: isUpdating} = useUpdateUser();
  const checkAndEnableBluetooth = async () => {
    try {
      const available = await BluetoothModule.isBluetoothAvailable();
      if (!available) {
        Alert.alert('❌ Lỗi', 'Thiết bị không hỗ trợ Bluetooth');
        return false;
      }
      const enabled = await BluetoothModule.isBluetoothEnabled();
      setIsEnabled(enabled);

      if (!enabled) {
        await BluetoothModule.enableBluetooth();
        setTimeout(async () => {
          const nowEnabled = await BluetoothModule.isBluetoothEnabled();
          setIsEnabled(nowEnabled);
        }, 1000);
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Check Bluetooth error:', error);
      return false;
    }
  };
  const startDiscovery = useCallback(async () => {
    try {
      // Check native state directly to avoid React state lag
      const enabled = await BluetoothModule.isBluetoothEnabled();
      if (!enabled) {
        Alert.alert('⚠️ Bluetooth chưa bật', 'Vui lòng bật Bluetooth trước');
        return;
      }

      setDiscovering(true);
      setDevices([]);
      await BluetoothModule.startDiscovery();
      console.log('🔍 Bắt đầu quét thiết bị');
    } catch (error: any) {
      console.error('Discovery error:', error);
      setDiscovering(false);
      Alert.alert('❌ Lỗi quét', error.message || String(error));
    }
  }, []);

  const connectTo = async (device: BluetoothDevice) => {
    try {
      // Kiểm tra xem đã có kết nối với thiết bị này chưa
      const isAlreadyConnected = connectedDevices.some(
        d => d.address === device.address,
      );

      if (isAlreadyConnected) {
        console.log('⚠️ Đã có kết nối với thiết bị này:', device.name);
        Alert.alert('⚠️ Đã kết nối', `Bạn đã kết nối với ${device.name} rồi`, [
          {text: 'OK'},
        ]);
        return;
      }

      console.log('🔌 Đang kết nối đến:', device.name);
      await BluetoothModule.connectToDevice(device.address);
    } catch (error: any) {
      console.error('Connect error:', error);

      // Không hiển thị alert nếu đã kết nối rồi
      if (error.code === 'ALREADY_CONNECTED') {
        console.log('⚠️ Native layer báo đã kết nối');
        return;
      }

      Alert.alert(
        '❌ Kết nối thất bại',
        `Không thể kết nối với ${device.name}\n\n${
          error.message || String(error)
        }`,
        [
          {text: 'Thử lại', onPress: () => connectTo(device)},
          {text: 'Đóng', style: 'cancel'},
        ],
      );
    }
  };

  const initializeBluetoothServer = useCallback(async () => {
    try {
      if (!isEnabled) return;

      // Bật discoverable
      await BluetoothModule.makeDiscoverable(3000);
      console.log('✅ Đã bật chế độ hiển thị (5 phút)');

      // Start server để chờ kết nối
      await BluetoothModule.startServer();
      console.log('✅ Server đã sẵn sàng chờ kết nối');
    } catch (error: any) {
      console.error('Initialize server error:', error);
    }
  }, [isEnabled]);

  const disconnect = async (address: string) => {
    console.log('disconect');
    try {
      await BluetoothModule.disconnect(address);
    } catch (error: any) {
      console.error('Disconnect error:', error);
    }
  };

  const disconnectAll = async () => {
    try {
      await BluetoothModule.disconnectAll();
      setConnectedDevices([]);
    } catch (error: any) {
      console.error('Disconnect all error:', error);
    }
  };

  const autoRename = useCallback(async () => {
    try {
      const {user} = userStore.getState();
      const newName = user?.name ? formatNameForBLE(user.name) : 'BLE_User';

      let bluetoothName = await BluetoothModule.getBluetoothName();
      console.log('Current Bluetooth Name:', bluetoothName);

      // Only rename if distinct
      if (bluetoothName !== newName) {
        await BluetoothModule.setBluetoothName(newName);
        console.log('✅ Đổi tên Bluetooth thành công:', newName);
      }
    } catch (err) {
      console.error('❌ Lỗi khi đổi tên Bluetooth:', err);
    }
  }, []);

  // Helper to ensure name starts with BLE if needed or just use user name?
  // User said: "lấy user.name của người dùng để đổi tên" -> "Use user.name to rename".
  // And previous logic added 'BLE'. User might want to KEEP 'BLE' prefix internally so we can validly strip it later, OR just use raw name?
  // The system seems to rely on 'BLE' prefix to identify app users?
  // Let's keep the BLE prefix for protocol but use user.name.
  // Actually, wait. User request: "tôi muốn ở hàm auto rename sẽ lấy user.name của người dùng để đổi tên" -> "I want auto rename function to use user.name".
  // And "còn đoạn ẩn tên đâu ví dụ BLEUser thì chỉ hiển thị User" -> "where is the hiding name part, e.g. BLEUser shows as User".
  // This implies the name SHOULD have BLE prefix internally.
  function formatNameForBLE(name: string): string {
    // Remove existing BLE prefix if user typed it, then add it back to be sure?
    // Or just ensure it starts with BLE.
    // If user name is "Tuan", device name becomes "BLE Tuan".
    // If user name is "BLE Tuan", device name "BLE Tuan".
    if (name.startsWith('BLE')) return name;
    return `BLE ${name}`;
  }
  const updateDeviceAddress = async (deviceAddress: string) => {
    try {
      if (!user?.id || !deviceAddress || user.deviceAddress === deviceAddress)
        return;

      await updateUser({
        id: user.id,
        data: {deviceAddress},
      });
      console.log('✅ Cập nhật địa chỉ Bluetooth thành công:', deviceAddress);
    } catch (err) {
      console.error('❌ Lỗi khi cập nhật địa chỉ Bluetooth:', err);
    }
  };
  return {
    isEnabled,
    checkAndEnableBluetooth,
    startDiscovery,
    devices,
    discovering,
    connectTo,
    initializeBluetoothServer,
    disconnect,
    disconnectAll,
    connectedDevices,
    setDevices,
    setDiscovering,
    setConnectedDevices,
    autoRename,
    updateDeviceAddress,
  };
};
