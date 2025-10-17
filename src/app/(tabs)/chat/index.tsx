import React, {useEffect, useState, useCallback} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BluetoothModule from '../../../assets/managers/BluetoothModule';
import {requestPermissions} from '../../../utils/permission';
import {navigate} from '../../../utils/navigationUtils';
import {Box} from '../../../components/common/Layout/Box';
import {Text} from '../../../components/common/Text/Text';
import {colors} from '../../../theme/colors';
import {formatName} from '../../../features/chat/utils/formatName';

// Interface cho device
interface BluetoothDevice {
  name: string;
  address: string;
  bondState: 'BONDED' | 'BONDING' | 'NONE' | 'UNKNOWN';
}

interface ConnectedDevice {
  name: string;
  address: string;
}
const ListMessageScreen = () => {
  const {top, bottom} = useSafeAreaInsets();
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [discovering, setDiscovering] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>(
    [],
  );

  // ✅ Kiểm tra và bật Bluetooth
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
          if (nowEnabled) {
            // loadBluetoothName();
          }
        }, 1000);
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Check Bluetooth error:', error);
      return false;
    }
  };

  // ✅ Quét thiết bị (dùng cho refresh)
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

  // ✅ Kết nối tới thiết bị
  const connectTo = async (device: BluetoothDevice) => {
    try {
      await BluetoothModule.connectToDevice(device.address);
    } catch (error: any) {
      console.error('Connect error:', error);
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

  // ✅ Khởi động server và discoverable (gọi ngay khi vào màn hình)
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

  useEffect(() => {
    const deviceFoundListener = BluetoothModule.addEventListener(
      'onDeviceFound',
      (device: BluetoothDevice) => {
        console.log('✅ Tìm thấy thiết bị app:', device);
        if (
          !device.name ||
          device.name.toLowerCase() === 'unknown' ||
          !device.name.startsWith('BLE')
        ) {
          return;
        }
        setDevices(prev => {
          const exists = prev.find(d => d.address === device.address);
          if (exists) return prev;
          return [...prev, device];
        });
      },
    );

    // Listener: Quét xong
    const discoveryFinishedListener = BluetoothModule.addEventListener(
      'onDiscoveryFinished',
      () => {
        console.log('Quét xong');
        setDiscovering(false);
      },
    );

    // Listener: Kết nối thành công
    const connectedListener = BluetoothModule.addEventListener(
      'onConnected',
      (info: {deviceName: string; deviceAddress: string}) => {
        console.log('Đã kết nối:', info);
        setConnectedDevices(prev => {
          const exists = prev.find(d => d.address === info.deviceAddress);
          if (exists) return prev;
          return [
            ...prev,
            {name: info.deviceName, address: info.deviceAddress},
          ];
        });
        navigate('ChatStack', {
          screen: 'Message',
          params: { name: info.deviceName}
        });
      },
    );

    // Listener: Ngắt kết nối
    const disconnectedListener = BluetoothModule.addEventListener(
      'onDisconnected',
      (info: {deviceAddress: string}) => {
        console.log('Đã ngắt kết nối:', info);
        setConnectedDevices(prev =>
          prev.filter(d => d.address !== info.deviceAddress),
        );
      },
    );

    // Listener: Mất kết nối
    const connectionLostListener = BluetoothModule.addEventListener(
      'onConnectionLost',
      (info: {deviceAddress: string}) => {
        console.log('Mất kết nối:', info);
        setConnectedDevices(prev =>
          prev.filter(d => d.address !== info.deviceAddress),
        );
        Alert.alert('⚠️ Mất kết nối', 'Đã mất kết nối với thiết bị');
      },
    );

    // Listener: Kết nối thất bại
    const connectionFailedListener = BluetoothModule.addEventListener(
      'onConnectionFailed',
      (error: {error: string; deviceName?: string; deviceAddress?: string}) => {
        console.log('Kết nối thất bại:', error);

        const title = error.deviceName
          ? `❌ Không thể kết nối với ${error.deviceName}`
          : '❌ Kết nối thất bại';

        Alert.alert(title, error.error, [
          {
            text: 'Thử lại',
            onPress: () => {
              if (error.deviceAddress) {
                const device = devices.find(
                  d => d.address === error.deviceAddress,
                );
                if (device) connectTo(device);
              }
            },
          },
          {text: 'Đóng', style: 'cancel'},
        ]);
      },
    );

    return () => {
      deviceFoundListener.remove();
      discoveryFinishedListener.remove();
      connectedListener.remove();
      disconnectedListener.remove();
      connectionLostListener.remove();
      connectionFailedListener.remove();
    };
  }, []);

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

  useEffect(() => {
    const init = async () => {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          '⚠️ Quyền bị từ chối',
          'Cần cấp quyền Bluetooth và Location để sử dụng tính năng này',
        );
        return;
      }

      const enabled = await checkAndEnableBluetooth();
      if (enabled) {
        await autoRename();
        await initializeBluetoothServer();
      }
    };

    init();

    return () => {
      BluetoothModule.disconnectAll().catch(console.error);
      BluetoothModule.stopDiscovery().catch(console.error);
    };
  }, []);

  useEffect(() => {
    if (isEnabled) {
      initializeBluetoothServer();
    }
  }, [isEnabled, initializeBluetoothServer]);

  const handleConected = (
    isConnectedDevice: boolean,
    item: BluetoothDevice,
  ) => {
    console.log('isConnectedDevice', item.name);
    if (!isConnectedDevice) {
      connectTo(item);
    } else {
      navigate('ChatStack', {
        screen: 'Message',
        params: { name: item.name }
      });
    }
  };

  const renderDevice = ({item}: {item: BluetoothDevice}) => {
    const isConnectedDevice = connectedDevices.some(
      d => d.address === item.address,
    );

    return (
      <TouchableOpacity onPress={() => handleConected(isConnectedDevice, item)}>
        <Box
          backgroundColor="white"
          p={16}
          mb={10}
          borderRadius={12}
          flexDirection="row"
          alignItems="center">
          <Box flex={1}>
            <Text fontSize={17} fontWeight="bold" color="#333">
              {formatName(item.name) || 'Unknown'} {isConnectedDevice && '✅'}
            </Text>
            <Text fontSize={12} color="#999">
              {item.address}
            </Text>
          </Box>
          <TouchableOpacity
            onPress={() =>
              isConnectedDevice ? disconnect(item.address) : connectTo(item)
            }>
            <Box
              backgroundColor={isConnectedDevice ? '#FF3B30' : '#007AFF'}
              py={8}
              px={16}
              borderRadius={8}>
              <Text color="white" fontWeight="bold">
                {isConnectedDevice ? 'Ngắt' : 'Kết nối'}
              </Text>
            </Box>
          </TouchableOpacity>
        </Box>
      </TouchableOpacity>
    );
  };

  return (
    <Box
      flex={1}
      backgroundColor={colors.background}
      px={16}
      pt={top}
      pb={bottom}>
      <Text fontSize={26} fontWeight="bold" align="center" color="#333">
        💬 Chat qua Bluetooth
      </Text>

      {/* Trạng thái */}
      <Box backgroundColor="white" p={14} borderRadius={12} mb={16}>
        <Text fontSize={14} color="#666">
          Bluetooth: {isEnabled ? '✅ Đã bật' : '❌ Chưa bật'}
        </Text>
        {connectedDevices.length > 0 && (
          <Text fontSize={14} color="#666">
            ✅ Đã kết nối với {connectedDevices.length} thiết bị
          </Text>
        )}
      </Box>

      {/* Nút ngắt kết nối */}
      {connectedDevices.length > 0 && (
        <Box mb={16} flexDirection="row" justifyContent="flex-end">
          <TouchableOpacity onPress={disconnectAll}>
            <Box
              backgroundColor="#FF3B30"
              py={12}
              px={20}
              borderRadius={8}
              alignItems="center">
              <Text color="white" fontWeight="bold">
                ❌ Ngắt tất cả ({connectedDevices.length})
              </Text>
            </Box>
          </TouchableOpacity>
        </Box>
      )}

      {discovering && (
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          p={14}
          backgroundColor="white"
          borderRadius={12}
          mb={16}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text color="#666" fontSize={14}>
            Đang tìm thiết bị chạy app...
          </Text>
        </Box>
      )}

      <Box flex={1}>
        {devices.length > 0 && (
          <Box mb={10}>
            <Text fontSize={16} fontWeight="bold" color="#333">
              📱 Thiết bị khả dụng ({devices.length})
            </Text>
          </Box>
        )}
        <FlatList
          data={devices}
          keyExtractor={(item, index) => `${item.address}-${index}`}
          renderItem={renderDevice}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={discovering}
              onRefresh={startDiscovery}
              colors={['#007AFF']}
              tintColor="#007AFF"
              title="Kéo để quét thiết bị"
              titleColor="#666"
            />
          }
          ListHeaderComponent={
            <TouchableOpacity
              onPress={() => {
                navigate('ChatStack', {
                  screen:'ChatAI'
                }
                )
              }}>
              <Box
                backgroundColor="white"
                p={16}
                mb={10}
                borderRadius={12}
                flexDirection="row"
                alignItems="center">
                <Box flex={1}>
                  <Text fontSize={17} fontWeight="bold" color="#333">
                    AI
                  </Text>
                </Box> 
              </Box>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            !discovering ? (
              <Box flex={1} justifyContent="center" alignItems="center" py={60}>
                <Text fontSize={64}>📱</Text>
                <Box mb={8}>
                  <Text fontSize={18} fontWeight="bold" color="#666">
                    Chưa tìm thấy thiết bị nào
                  </Text>
                </Box>
                <Text fontSize={14} color="#999" align="center">
                  Kéo xuống để quét thiết bị{'\n'}
                  hoặc đợi người khác kết nối đến bạn
                </Text>
              </Box>
            ) : null
          }
        />
      </Box>
    </Box>
  );
};

export default ListMessageScreen;
