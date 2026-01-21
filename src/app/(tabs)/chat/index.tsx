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

  // Lưu room info cho mỗi device (key là deviceAddress)
  const roomInfoRef = useRef<{[deviceAddress: string]: RoomInfo}>({});
  const imageChunksRef = useRef<{[key: string]: ImageChunk}>({});

  const {mutateAsync: createUser} = useCreateUser();
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
      room.receiver.name?.toLowerCase().includes(searchText.toLowerCase()),
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

  // Map discovered devices by address for quick lookup
  const onlineDevicesMap = useMemo(() => {
    const map = new Map<string, BluetoothDevice>();
    devices.forEach(d => map.set(d.address, d));
    return map;
  }, [devices]);

  // Filter out devices that are already linked to a room
  const displayDevices = useMemo(() => {
    return filteredDevices.filter(device => {
      // Check if this device belongs to any room's receiver
      const isLinkedToRoom = rooms.some(
        room => room.receiver?.deviceAddress === device.address,
      );
      return !isLinkedToRoom;
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

  // ==================== XỬ LÝ TIN NHẮN & EVENTS ====================

  const handleUserInfo = async (sender: User, senderAddress: string) => {
    try {
      if (!user?.id || !sender?.id) return;

      await updateDeviceAddress(sender?.deviceAddress || '');
      const room = await getRoomByMember(user.id, sender.id);

      sender.deviceAddress = senderAddress;
      await createUser(sender);

      roomInfoRef.current[senderAddress] = {
        roomId: room.id,
        receiver: sender,
      };

      const myAddress = user.deviceAddress || '';
      const roomInfoData = {
        type: 'ROOM_INFO',
        room,
        user: {
          id: user.id,
          name: user.name,
          image: user?.image || '',
          deviceAddress: myAddress,
        },
      };

      await BluetoothModule.sendMessageToAll(JSON.stringify(roomInfoData));
      handleNavigateToChat(roomInfoRef.current[senderAddress]);
    } catch (error) {
      console.error('❌ Error handling user info:', error);
    }
  };

  const handleRoomInfo = async (
    room: Room,
    receiver: User,
    receiverAddress: string,
  ) => {
    try {
      if (!room || !receiver) return;

      await createRoom(room);

      roomInfoRef.current[receiverAddress] = {
        roomId: room.id,
        receiver: {
          id: receiver.id,
          name: receiver.name,
          email: receiver.email,
          deviceAddress: receiver.deviceAddress,
        },
      };

      await createUser(receiver);
      handleNavigateToChat(roomInfoRef.current[receiverAddress]);
    } catch (error) {
      console.error('❌ Error handling room info:', error);
    }
  };

  const handleMessageReceived = async (data: any) => {
    const {message, deviceAddress} = data;
    try {
      const jsonData = JSON.parse(message);

      if (jsonData.type === 'USER_INFO') {
        await handleUserInfo(jsonData.user, deviceAddress);
        return;
      }

      if (jsonData.type === 'ROOM_INFO') {
        await handleRoomInfo(jsonData.room, jsonData.user, deviceAddress);
        return;
      }

      if (jsonData.id && jsonData.roomId) {
        if (jsonData.type === 'text') {
          await createMessage(jsonData);
        } else if (jsonData.type === 'image') {
          await handleImageChunk(jsonData, deviceAddress);
        }
        return;
      }
    } catch (e) {
      console.error('❌ Error parsing message:', e);
    }
  };

  const handleImageChunk = async (
    messageEntity: any,
    deviceAddress: string,
  ) => {
    const {
      id: messageId,
      message: chunk,
      width,
      height,
      roomId,
      created_by,
      createdAt,
    } = messageEntity;

    if (!imageChunksRef.current[messageId]) {
      imageChunksRef.current[messageId] = {
        chunks: [],
        totalChunks: 10,
        receivedChunks: 0,
        timestamp: new Date(createdAt).getTime(),
        senderName: '',
        deviceAddress,
        width,
        height,
        roomId,
        created_by,
      };
    }

    const imageData = imageChunksRef.current[messageId];
    imageData.chunks.push(chunk);
    imageData.receivedChunks++;

    if (imageData.receivedChunks >= imageData.totalChunks) {
      const base64Image = imageData.chunks.join('');
      try {
        await createMessage({
          id: messageId,
          message: base64Image,
          createdAt: new Date(imageData.timestamp),
          type: 'image',
          width: imageData.width || 0,
          height: imageData.height || 0,
          roomId: imageData.roomId,
          created_by: imageData.created_by,
          status: 'delivered',
        });
      } catch (error) {
        console.error('❌ Error saving image to DB:', error);
      }
      delete imageChunksRef.current[messageId];
    }
  };

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
          const exists = prev.find(d => d.address === device.address);
          if (exists) return prev;
          return [...prev, device];
        });
      },
    );

    const discoveryFinishedListener = BluetoothModule.addEventListener(
      'onDiscoveryFinished',
      () => {
        setDiscovering(false);
      },
    );

    const messageReceivedListener = BluetoothModule.addEventListener(
      'onMessageReceived',
      async (data: any) => await handleMessageReceived(data),
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

        if (user?.id) {
          try {
            const userInfoData = {
              type: 'USER_INFO',
              user: {
                id: user.id,
                name: user.name,
                image: user.image || '',
                deviceAddress: info.deviceAddress,
              },
            };
            await BluetoothModule.sendMessageToAll(
              JSON.stringify(userInfoData),
            );
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
      messageReceivedListener.remove();
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
      screen: 'Message',
      params: {
        roomId: roomResponse.id,
        receiver: roomResponse.receiver,
      },
    });
  }, []);

  const handleNavigateToChat = useCallback((roomInfo: RoomInfo) => {
    navigate('ChatStack', {
      screen: 'Message',
      params: {
        roomId: roomInfo.roomId,
        receiver: roomInfo.receiver,
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
        data={displayDevices}
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

            {/* Saved Rooms Section */}
            {filteredRooms.length > 0 && (
              <Box mb={8} mt={16}>
                <Box
                  mb={12}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Text fontSize={16} fontWeight="bold" color="#333">
                    Tin nhắn ({filteredRooms.length})
                  </Text>
                </Box>
                {filteredRooms.map(room => {
                  const deviceAddress = room.receiver?.deviceAddress;
                  const matchedDevice = deviceAddress
                    ? onlineDevicesMap.get(deviceAddress)
                    : undefined;
                  const isOnline = !!matchedDevice;
                  const isConnected = deviceAddress
                    ? connectedDevices.some(d => d.address === deviceAddress)
                    : false;

                  return (
                    <RoomItem
                      key={room.id}
                      name={formatName(room.receiver.name) || 'Unknown'}
                      avatar={room.receiver.image}
                      lastMessage={room.lastMessage}
                      updatedAt={room.updatedAt || room.createdAt}
                      onPress={() => handleRoomPress(room)}
                      isScanned={isOnline}
                      isConnected={isConnected}
                      onConnect={() =>
                        matchedDevice && connectTo(matchedDevice)
                      }
                      onDisconnect={() =>
                        matchedDevice && disconnect(matchedDevice.address)
                      }
                    />
                  );
                })}
              </Box>
            )}

            {/* Devices Section Header - Only show if we have devices locally */}
            {displayDevices.length > 0 && (
              <Box
                mb={12}
                mt={16}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center">
                <Text fontSize={16} fontWeight="bold" color="#333">
                  Thiết bị gần đây ({displayDevices.length})
                </Text>
                {discovering && (
                  <ActivityIndicator size="small" color={colors.primary} />
                )}
              </Box>
            )}
          </Box>
        }
        renderItem={({item}) => (
          <Box px={16} mb={10}>
            <DeviceItem
              item={item}
              isConnectedDevice={connectedDevices.some(
                d => d.address === item.address,
              )}
              connectTo={connectTo}
              disconnect={disconnect}
              onConnected={(isConnected, device) =>
                isConnected ? disconnect(device.address) : connectTo(device)
              }
            />
          </Box>
        )}
        keyExtractor={item => item.address}
        ListEmptyComponent={
          discovering ? (
            <Box alignItems="center" py={20}>
              <Text color="#999">Đang tìm kiếm thiết bị...</Text>
            </Box>
          ) : displayDevices.length === 0 ? (
            <Box alignItems="center" py={20}>
              <Text color="#999">Không tìm thấy thiết bị nào</Text>
            </Box>
          ) : null
        }
      />
    </Box>
  );
};

export default ListMessageScreen;
