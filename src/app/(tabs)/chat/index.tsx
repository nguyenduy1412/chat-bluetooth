import {useEffect, useCallback, useRef} from 'react';
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
import {getUserByAttributes} from '@/features/auth/api/getUserByAttributes';
import {getRoomByMember} from '@/features/chat/api/getRoomByMember';
import {userStore} from '@/store/userStore';
import type {
  BluetoothDevice,
  ImageChunk,
  RoomInfo,
} from '@/features/chat/types';
import DeviceItem from '@/features/chat/components/DeviceItem';
import {useBluetooth} from '@/features/chat/hooks/useBluetooth';
import {User} from '@/database/entities/User';
import {Room} from '@/database/entities/Room';
import {useCreateUser} from '@/features/auth/hooks/useCreateUser';
import {RoomRepository} from '@/database/repositories/RoomRepository';
import {UserRepository} from '@/database/repositories/UserRepository';
import {createRoom} from '@/features/chat/api/createRoom';
import { useCreateMessage } from '@/features/chat/hooks/useCreateMessage';

const roomRepo = new RoomRepository();
const userRepo = new UserRepository();
const ListMessageScreen = () => {
  const {top, bottom} = useSafeAreaInsets();

  const {user, setUser} = userStore();

  // Lưu room info cho mỗi device (key là deviceAddress)
  const roomInfoRef = useRef<{[deviceAddress: string]: RoomInfo}>({});

  const imageChunksRef = useRef<{[key: string]: ImageChunk}>({});

  const {mutateAsync: createUser, isPending} = useCreateUser();
  const {mutateAsync: createMessage} = useCreateMessage();
  const fetchAll = async () => {
    const rooms = await roomRepo.findAll();
    console.log('rooms', rooms);
    const users = await userRepo.findAll();
    console.log('users', users);
  };
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

  // ==================== XỬ LÝ TIN NHẮN ====================

  const handleUserInfo = async (sender: User, senderAddress: string) => {
    try {
      console.log('👤 [RESPONDER] Received USER_INFO from:', sender.name);
      console.log('   Sender ID:', sender.id);
      console.log('   Sender Address:', senderAddress);

      if (!user?.id || !sender?.id) return;

      // Cập nhật địa chỉ Bluetooth của chính mình (nếu sender gửi kèm)
      await updateDeviceAddress(sender?.deviceAddress || '');

      // Tạo hoặc lấy room (chỉ bên Responder tạo)
      const room = await getRoomByMember(user.id, sender.id);
      console.log('✅ [RESPONDER] Room created/found:', room.id);

      // Lưu sender với deviceAddress đúng
      sender.deviceAddress = senderAddress;
      await createUser(sender);

      // Lưu room info vào ref
      roomInfoRef.current[senderAddress] = {
        roomId: room.id,
        receiver: sender,
      };

      // Lấy địa chỉ của chính mình (đã được set bởi bên kia)
      const myAddress = user.deviceAddress || '';

      // Gửi ROOM_INFO với room và user info của chính mình
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

      console.log('📤 [RESPONDER] Sending ROOM_INFO with room:', room.id);
      console.log('   My Address:', myAddress);
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
      console.log('🏠 [INITIATOR] Received ROOM_INFO');
      console.log('   Room ID:', room.id);
      console.log('   Receiver:', receiver.name);
      console.log('   Receiver Address:', receiverAddress);

      if (!room || !receiver) {
        console.error('Invalid room or receiver data');
        return;
      }

      // ✅ LƯU ROOM VÀO DATABASE
      // Với deterministic ID, createRoom sẽ tìm thấy room có sẵn hoặc tạo mới
      await createRoom(room);
      console.log('✅ Room saved to database:', room.id);

      // Lưu room info vào ref
      roomInfoRef.current[receiverAddress] = {
        roomId: room.id,
        receiver: {
          id: receiver.id,
          name: receiver.name,
          email: receiver.email,
          deviceAddress: receiver.deviceAddress,
        },
      };

      // Lưu receiver user vào database
      await createUser(receiver);

      console.log('✅ [INITIATOR] Room info saved, navigating to chat');
      handleNavigateToChat(roomInfoRef.current[receiverAddress]);
    } catch (error) {
      console.error('❌ Error handling room info:', error);
    }
  };

  const handleMessageReceived = async (data: any) => {
    console.log('📩 Message received data:', data);
    const {message, senderName, deviceAddress} = data;

    console.log('📩 Received message in index:', message);

    try {
      const jsonData = JSON.parse(message);

      // Xử lý USER_INFO protocol
      if (jsonData.type === 'USER_INFO') {
        await handleUserInfo(jsonData.user, deviceAddress);
        return;
      }

      // Xử lý ROOM_INFO protocol
      if (jsonData.type === 'ROOM_INFO') {
        await handleRoomInfo(jsonData.room, jsonData.user, deviceAddress);
        return;
      }

      // Xử lý MessageEntity (text hoặc image chunk)
      if (jsonData.id && jsonData.roomId) {
        if (jsonData.type === 'text') {
          // Tin nhắn text - lưu trực tiếp vào DB
          console.log('📨 Text message from', jsonData.created_by);
          await createMessage(jsonData);
        } else if (jsonData.type === 'image') {
          // Tin nhắn ảnh - ghép các chunk lại
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

    // Khởi tạo storage nếu chưa có
    if (!imageChunksRef.current[messageId]) {
      imageChunksRef.current[messageId] = {
        chunks: [],
        totalChunks: 10, // Theo logic gửi
        receivedChunks: 0,
        timestamp: new Date(createdAt).getTime(),
        senderName: '',
        deviceAddress,
        width,
        height,
        roomId,
        created_by,
      };
      console.log(`📸 Image start: ${messageId}`);
    }

    const imageData = imageChunksRef.current[messageId];
    imageData.chunks.push(chunk);
    imageData.receivedChunks++;

    const progress = Math.round(
      (imageData.receivedChunks / imageData.totalChunks) * 100,
    );

    console.log(
      `📦 Chunk ${imageData.receivedChunks}/${imageData.totalChunks} (${progress}%)`,
    );

    // Khi nhận đủ chunks, ghép lại và lưu
    if (imageData.receivedChunks >= imageData.totalChunks) {
      const base64Image = imageData.chunks.join('');

      console.log(
        `✅ Image received: ${messageId}, ${(base64Image.length / 1024).toFixed(
          1,
        )}KB`,
      );

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

        console.log('✅ Image saved to DB:', messageId);
      } catch (error) {
        console.error('❌ Error saving image to DB:', error);
      }

      // Xóa khỏi ref
      delete imageChunksRef.current[messageId];
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

    // Listener: Tin nhắn nhận được
    const messageReceivedListener = BluetoothModule.addEventListener(
      'onMessageReceived',
      async (data: any) => await handleMessageReceived(data),
    );

    // Listener: Kết nối thành công
    const connectedListener = BluetoothModule.addEventListener(
      'onConnected',
      async (info: {deviceName: string; deviceAddress: string}) => {
        console.log('Đã kết nối:', info);
        setConnectedDevices(prev => {
          const exists = prev.find(d => d.address === info.deviceAddress);
          if (exists) return prev;
          return [
            ...prev,
            {name: info.deviceName, address: info.deviceAddress},
          ];
        });

        // Gửi thông tin user qua Bluetooth ngay sau khi kết nối
        // Cả 2 bên đều gửi USER_INFO, race condition sẽ được xử lý bởi deterministic room ID
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
            console.log('📤 Sent USER_INFO:', user.name);
          } catch (error) {
            console.error('❌ Error sending user info:', error);
          }
        }
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
      messageReceivedListener.remove();
      // imageReceivedListener.remove();
      deviceFoundListener.remove();
      discoveryFinishedListener.remove();
      connectedListener.remove();
      disconnectedListener.remove();
      connectionLostListener.remove();
      connectionFailedListener.remove();
    };
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
    fetchAll();
    if (isEnabled) {
      initializeBluetoothServer();
    }
  }, [isEnabled, initializeBluetoothServer]);

  const handleConnected = useCallback(
    async (isConnectedDevice: boolean, item: BluetoothDevice) => {
      console.log('isConnectedDevice', item.name);
      if (!isConnectedDevice) {
        await connectTo(item);
      } else {
        // Lấy room info từ ref
        const roomInfo = roomInfoRef.current[item.address];
        console.log('roomInfo', roomInfo);
        if (roomInfo) {
          // Đã có room info, navigate với params đầy đủ
          handleNavigateToChat(roomInfo);
        } else {
          // Chưa có room info, chờ 1 chút rồi thử lại
          Alert.alert(
            '⏳ Đang đồng bộ...',
            'Vui lòng chờ giây lát để đồng bộ thông tin room',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Thử lại sau 2s
                  setTimeout(() => {
                    const updatedRoomInfo = roomInfoRef.current[item.address];
                    if (updatedRoomInfo) {
                      console.log('updatedRoomInfo', updatedRoomInfo);
                      handleNavigateToChat(updatedRoomInfo);
                    } else {
                      Alert.alert(
                        '❌ Lỗi',
                        'Không thể đồng bộ thông tin room. Vui lòng thử lại.',
                      );
                    }
                  }, 2000);
                },
              },
            ],
          );
        }
      }
    },
    [connectTo],
  );
  const handleNavigateToChat = useCallback((roomInfo: RoomInfo) => {
    navigate('ChatStack', {
      screen: 'Message',
      params: {
        roomId: roomInfo.roomId,
        receiver: roomInfo.receiver,
      },
    });
  }, []);
  const renderDevice = useCallback(
    ({item}: {item: BluetoothDevice}) => {
      const isConnectedDevice = connectedDevices.some(
        d => d.address === item.address,
      );

      return (
        <DeviceItem
          item={item}
          isConnectedDevice={isConnectedDevice}
          onConnected={handleConnected}
          connectTo={connectTo}
          disconnect={disconnect}
        />
      );
    },
    [connectedDevices, connectTo, disconnect, handleConnected],
  );

  const handleChatAI = useCallback(async () => {
    const ai = await getUserByAttributes({system: true});
    console.log('ai', ai);
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
            <TouchableOpacity onPress={handleChatAI}>
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
