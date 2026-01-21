import {useEffect, useCallback, useRef, useState, useMemo} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Switch,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BluetoothModule from '../../../assets/managers/BluetoothModule';
import {requestPermissions} from '../../../utils/permission';
import {navigate} from '../../../utils/navigationUtils';
import {Box} from '../../../components/common/Layout/Box';
import {Text} from '../../../components/common/Text/Text';
import {colors} from '../../../theme/colors';
import {getUserByAttributes} from '@/features/auth/api/getUserByAttributes';
import {getRoomByMember} from '@/features/chat/api/getRoomByMember';
import {userStore} from '@/store/userStore';
import type {
  BluetoothDevice,
  ImageChunk,
  RoomInfo,
  RoomResponse,
} from '@/features/chat/types';
import DeviceItem from '@/features/chat/components/DeviceItem';
import {RoomItem} from '@/features/chat/components/RoomItem';
import {HeaderSearch} from '@/features/chat/components/HeaderSearch';
import {useBluetooth} from '@/features/chat/hooks/useBluetooth';
import {User} from '@/database/entities/User';
import {Room} from '@/database/entities/Room';
import {useCreateUser} from '@/features/auth/hooks/useCreateUser';
import {RoomRepository} from '@/database/repositories/RoomRepository';
import {UserRepository} from '@/database/repositories/UserRepository';
import {createRoom} from '@/features/chat/api/createRoom';
import {useCreateMessage} from '@/features/chat/hooks/useCreateMessage';
import {useGetRoomsByUserId} from '@/features/chat/hooks/useGetRoomsByUserId';
import {useQueryClient} from '@tanstack/react-query';
import {formatName} from '@/features/chat/utils/formatName';

const roomRepo = new RoomRepository();
const userRepo = new UserRepository();

const ListMessageScreen = () => {
  const {top, bottom} = useSafeAreaInsets();
  const {user} = userStore();
  const queryClient = useQueryClient();

  // State
  const [searchText, setSearchText] = useState('');
  const [isBluetoothOn, setIsBluetoothOn] = useState(false);

  const {mutateAsync: createMessage} = useCreateMessage();

  // Fetch rooms with receiver info using hook
  const {
    data: rooms = [],
    isLoading: isLoadingRooms,
    refetch: refetchRooms,
  } = useGetRoomsByUserId({
    id: user?.id || '',
    queryConfig: {
      enabled: !!user?.id,
    },
  });

  const roomsRef = useRef(rooms);
  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  const {
    checkAndEnableBluetooth,
    startDiscovery,
    connectTo,
    initializeBluetoothServer,
    disconnect,
    disconnectAll,
    devices,
    discovering,
    isEnabled,
    connectedDevices,
    setDevices,
    setDiscovering,
    setConnectedDevices,
    autoRename,
    updateDeviceAddress,
  } = useBluetooth();

  // Filter logic
  const filteredRooms = useMemo(() => {
    if (!searchText) return rooms;
    return rooms.filter(room =>
      room.receiver?.name?.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [rooms, searchText]);

  const filteredDevices = useMemo(() => {
    if (!searchText) return devices;
    return devices.filter(
      device =>
        device.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        device.address?.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [devices, searchText]);
  console.log('filteredRooms',filteredRooms);
  
  // Map discovered devices by address for quick lookup
  const onlineDevicesMap = useMemo(() => {
    const map = new Map<string, BluetoothDevice>();
    devices.forEach(d => map.set(d.address, d));
    return map;
  }, [devices]);

  // Filter out devices that are already linked to a room
  const displayDevices = useMemo(() => {
    console.log(
      '🔍 Filtering devices. Total rooms:',
      rooms.length,
      'Total scanned devices:',
      filteredDevices.length,
    );

    const list = filteredDevices.filter(device => {
      // Check if this device belongs to any room's receiver (case-insensitive)
      const isLinkedToRoom = rooms.some(room => {
        const roomDeviceAddr = room.receiver?.deviceAddress;
        const scannedDeviceAddr = device.address;

        // Ensure both are strings before comparing
        if (
          typeof roomDeviceAddr !== 'string' ||
          typeof scannedDeviceAddr !== 'string'
        ) {
          return false;
        }

        const matches =
          roomDeviceAddr.toLowerCase() === scannedDeviceAddr.toLowerCase();
        if (matches) {
          console.log(
            `✅ Found match! Device "${device.name}" (${device.address}) already has room with "${room.receiver?.name}"`,
          );
        }
        return matches;
      });

      return !isLinkedToRoom; // Only keep devices NOT linked to any room
    });

    console.log('📱 Devices to display (not in rooms):', list.length);

    // Sort: Online first, then Offline. Secondary sort by name.
    return list.sort((a, b) => {
      if (a.isOnline === b.isOnline) {
        return (a.name || '').localeCompare(b.name || '');
      }
      return a.isOnline ? -1 : 1;
    });
  }, [filteredDevices, rooms]);

  // Initial Auto Scan & Bluetooth Check
  useEffect(() => {
    const init = async () => {
      const enabled = await checkAndEnableBluetooth();
      setIsBluetoothOn(!!enabled);

      if (enabled) {
        await autoRename();
        await initializeBluetoothServer();
        // Tự động quét khi vào màn hình
        startDiscovery();
      }
    };
    init();
  }, []); // Only run on mount

  const handleToggleBluetooth = async (value: boolean) => {
    setIsBluetoothOn(value);
    if (value) {
      const enabled = await checkAndEnableBluetooth();
      if (enabled) {
        await initializeBluetoothServer();
        startDiscovery();
      }
    } else {
      // Logic disable scan (module might not support explicit disable bluetooth)
      setDiscovering(false);
    }
  };

  const onRefresh = useCallback(() => {
    refetchRooms();
    if (isBluetoothOn) {
      startDiscovery();
    }
  }, [isBluetoothOn, refetchRooms, startDiscovery]);

  useEffect(() => {
    const deviceFoundListener = BluetoothModule.addEventListener(
      'onDeviceFound',
      (device: BluetoothDevice) => {
        if (
          !device.name ||
          device.name.toLowerCase() === 'unknown' ||
          !device.name.startsWith('BLE')
        ) {
          return;
        }
        setDevices(prev => {
          const index = prev.findIndex(d => d.address === device.address);

          if (index !== -1) {
            // Update exist device (mark Online)
            const newDevices = [...prev];
            newDevices[index] = {...newDevices[index], isOnline: true};
            return newDevices;
          }

          // Add new device (Online)
          return [...prev, {...device, isOnline: true}];
        });
      },
    );

    const discoveryFinishedListener = BluetoothModule.addEventListener(
      'onDiscoveryFinished',
      () => {
        setDiscovering(false);
      },
    );

    const connectedListener = BluetoothModule.addEventListener(
      'onConnected',
      async (info: {deviceName: string; deviceAddress: string}) => {
        setConnectedDevices(prev => {
          const exists = prev.find(d => d.address === info.deviceAddress);
          if (exists) return prev;
          return [
            ...prev,
            {name: info.deviceName, address: info.deviceAddress},
          ];
        });

        // 🚀 OPTIMISTIC NAVIGATION: Check if we already have a room with this device
        const matchedRoom = roomsRef.current.find(
          r => r.receiver?.deviceAddress === info.deviceAddress,
        );
        if (matchedRoom) {
          console.log(
            '🚀 Optimistic Navigation to existing room:',
            matchedRoom.receiver.name,
          );
          handleRoomPress(matchedRoom);
        }

        // Get fresh user from store to avoid stale closure
        const currentUser = userStore.getState().user;

        if (currentUser?.id) {
          try {
            const userInfoData = {
              type: 'USER_INFO',
              user: {
                id: currentUser.id,
                name: currentUser.name,
                image: currentUser.image || '',
                deviceAddress: info.deviceAddress,
              },
            };

            // Wait 300ms for connection stability (enough for Android)
            setTimeout(async () => {
              try {
                console.log('📤 Sending USER_INFO...');
                await BluetoothModule.sendMessageToAll(
                  JSON.stringify(userInfoData),
                );
              } catch (e) {
                console.error('❌ Error sending user info after delay:', e);
              }
            }, 300);
          } catch (error) {
            console.error('❌ Error sending user info:', error);
          }
        }
      },
    );

    const disconnectedListener = BluetoothModule.addEventListener(
      'onDisconnected',
      (info: {deviceAddress: string}) => {
        setConnectedDevices(prev =>
          prev.filter(d => d.address !== info.deviceAddress),
        );
      },
    );

    const connectionLostListener = BluetoothModule.addEventListener(
      'onConnectionLost',
      (info: {deviceAddress: string}) => {
        setConnectedDevices(prev =>
          prev.filter(d => d.address !== info.deviceAddress),
        );
        Alert.alert('⚠️ Mất kết nối', 'Đã mất kết nối với thiết bị');
      },
    );

    const connectionFailedListener = BluetoothModule.addEventListener(
      'onConnectionFailed',
      (error: {error: string; deviceName?: string; deviceAddress?: string}) => {
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

  const handleRoomPress = useCallback((roomResponse: RoomResponse) => {
    navigate('ChatStack', {
      screen: 'MessageScreen',
      params: {
        roomId: roomResponse.id,
        receiver: roomResponse.receiver,
      },
    });
  }, []);

  const handleChatAI = useCallback(async () => {
    const ai = await getUserByAttributes({system: true});
    if (!user?.id || !ai?.id) return;
    const room = await getRoomByMember(user?.id, ai?.id);
    navigate('ChatStack', {
      screen: 'ChatAIScreen',
      params: {
        roomId: room.id,
        receiver: ai,
      },
    });
  }, []);

  // Merge Rooms and New Devices
  const mergedList = useMemo(() => {
    const list = [];

    // 1. Add Rooms (Updated with Online Status)
    filteredRooms.forEach(room => {
      list.push({type: 'room', data: room});
    });

    // 2. Add New Devices (Not linked to any room)
    displayDevices.forEach(device => {
      list.push({type: 'device', data: device});
    });

    // Sort: Online/Connected first, then by time/name
    return list.sort((a, b) => {
      // Logic sort complicated? Keep simple for now: Rooms first (usually chatted recently), then devices.
      // Or prioritize Online?
      // User didn't specify sort, but "gộp lại" implies single view.
      // Let's rely on Room vs Device distinction for now or just append.
      // Actually, let's put Online items at top.
      const isOnlineA =
        a.type === 'room'
          ? !!onlineDevicesMap.get(a.data.receiver?.deviceAddress || '')
          : true; // Device in displayDevices is by definition scanned (online-ish) or at least visible

      const isOnlineB =
        b.type === 'room'
          ? !!onlineDevicesMap.get(b.data.receiver?.deviceAddress || '')
          : true;

      if (isOnlineA !== isOnlineB) return isOnlineA ? -1 : 1;
      return 0;
    });
  }, [filteredRooms, displayDevices, onlineDevicesMap]);

  return (
    <Box flex={1} backgroundColor="#F5F5F5">
      {/* Custom Header with Search */}
      <Box
        backgroundColor="white"
        pt={top + 10}
        pb={12}
        px={16}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 3,
          zIndex: 10,
        }}>
        <HeaderSearch value={searchText} onChangeText={setSearchText} />
      </Box>

      <FlatList
        data={mergedList}
        contentContainerStyle={{paddingBottom: bottom + 20}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            tintColor="transparent"
            colors={['transparent']}
          />
        }
        ListHeaderComponent={
          <Box px={16} pt={16}>
            {/* Bluetooth Toggle Section */}
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              mb={20}
              backgroundColor="white"
              p={16}
              borderRadius={16}
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <Box flex={1} mr={16}>
                <Text fontSize={16} fontWeight="bold" color="#333">
                  Bluetooth
                </Text>
                <Text fontSize={13} color="#888">
                  {isBluetoothOn
                    ? discovering
                      ? 'Đang quét thiết bị xung quanh...'
                      : 'Đã bật & sẵn sàng kết nối'
                    : 'Bật để tìm kiếm thiết bị'}
                </Text>
              </Box>
              <Switch
                trackColor={{false: '#e0e0e0', true: colors.primary}}
                thumbColor={'#fff'}
                ios_backgroundColor="#e0e0e0"
                onValueChange={handleToggleBluetooth}
                value={isBluetoothOn}
              />
            </Box>

            {/* AI Chat Entry */}
            <RoomItem
              name="Trợ lý AI"
              isAI={true}
              onPress={handleChatAI}
              lastMessage={{
                message: 'Sẵn sàng hỗ trợ bạn mọi lúc',
                type: 'text',
              }}
            />

            <Box mb={12} mt={16}>
              <Text fontSize={16} fontWeight="bold" color="#333">
                Tin nhắn & Thiết bị ({mergedList.length})
              </Text>
            </Box>
          </Box>
        }
        renderItem={({item}) => {
          if (item.type === 'room') {
            const room = item.data as RoomResponse;
            const deviceAddress = room.receiver?.deviceAddress;
            const matchedDevice = deviceAddress
              ? onlineDevicesMap.get(deviceAddress)
              : undefined;
            const isOnline = !!matchedDevice;
            const isConnected = deviceAddress
              ? connectedDevices.some(d => d.address === deviceAddress)
              : false;

            return (
              <Box px={16}>
                <RoomItem
                  key={room.id}
                  name={formatName(room.receiver.name) || 'Unknown'}
                  avatar={room.receiver.image}
                  lastMessage={room.lastMessage}
                  updatedAt={room.updatedAt || room.createdAt}
                  onPress={() => handleRoomPress(room)}
                  isScanned={isOnline}
                  isConnected={isConnected}
                  onConnect={() => matchedDevice && connectTo(matchedDevice)}
                  onDisconnect={() =>
                    matchedDevice && disconnect(matchedDevice.address)
                  }
                />
              </Box>
            );
          } else {
            // New Device (Not added friend yet)
            const device = item.data as BluetoothDevice;
            const isConnected = connectedDevices.some(
              d => d.address === device.address,
            );

            return (
              <Box px={16}>
                <RoomItem
                  key={device.address}
                  name={formatName(device.name) || 'Người lạ'}
                  avatar={null}
                  lastMessage={{message: 'Thiết bị mới tìm thấy', type: 'text'}}
                  updatedAt={new Date()} // Now
                  onPress={() => connectTo(device)} // Auto connect on press? Or show modal?
                  // For now, press = connect. Once connected, handshake creates room -> refreshes list -> becomes 'room' type.
                  isScanned={true}
                  isConnected={isConnected}
                  onConnect={() => connectTo(device)}
                  onDisconnect={() => disconnect(device.address)}
                />
              </Box>
            );
          }
        }}
        keyExtractor={item =>
          item.type === 'room'
            ? (item.data as RoomResponse).id
            : (item.data as BluetoothDevice).address
        }
        ListEmptyComponent={
          discovering ? (
            <Box alignItems="center" py={20}>
              <Text color="#999">Đang tìm kiếm thiết bị...</Text>
            </Box>
          ) : (
            <Box alignItems="center" py={20}>
              <Text color="#999">Không có tin nhắn nào</Text>
            </Box>
          )
        }
      />
    </Box>
  );
};

export default ListMessageScreen;
