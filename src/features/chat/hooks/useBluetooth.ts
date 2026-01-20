import {Alert} from 'react-native';
import BluetoothModule from '../../../assets/managers/BluetoothModule';
import {useCallback, useState} from 'react';
import {BluetoothDevice, ConnectedDevice} from '../types';
export const useBluetooth = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>(
    [],
  );
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
      if (!isEnabled) {
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
  }, [isEnabled]);
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
      let bluetoothName = await BluetoothModule.getBluetoothName();

      if (!bluetoothName.startsWith('BLE')) {
        bluetoothName = 'BLE' + bluetoothName;
        await BluetoothModule.setBluetoothName(bluetoothName);

        let retry = 0;
        while (retry < 5) {
          const currentName = await BluetoothModule.getBluetoothName();
          if (currentName === bluetoothName) {
            console.log('✅ Đổi tên Bluetooth thành công:', currentName);
            return;
          }
          await new Promise(res => setTimeout(res, 1000));
          retry++;
        }
        console.warn('⚠️ Đổi tên Bluetooth thất bại sau 5 lần thử');
      }
    } catch (err) {
      console.error('❌ Lỗi khi đổi tên Bluetooth:', err);
    }
  }, []);

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
  };
};
