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
import {getSizeImage} from '@/utils/getSizeImage';
import {createMessage} from '@/features/chat/api/createMessage';
import {v4} from 'uuid';
import type {
  BluetoothDevice,
  ImageChunk,
  RoomInfo,
} from '@/features/chat/types';
import DeviceItem from '@/features/chat/components/DeviceItem';
import {useBluetooth} from '@/features/chat/hooks/useBluetooth';
import {User} from '@/database/entities/User';
import {Room} from '@/database/entities/Room';
import {de, id} from 'zod/v4/locales';
import {createRoom} from '@/features/chat/api/createRoom';
import {useCreateUser} from '@/features/auth/hooks/useCreateUser';

const ListMessageScreen = () => {
  const {top, bottom} = useSafeAreaInsets();

  const {user,setUser} = userStore();

  // Lưu room info cho mỗi device (key là deviceAddress)
  const roomInfoRef = useRef<{[deviceAddress: string]: RoomInfo}>({});

  const imageChunksRef = useRef<{[key: string]: ImageChunk}>({});
  const {mutateAsync: createUser, isPending} = useCreateUser();

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

  const handleUserInfo = async (sender: User, receiverAddress: string) => {
    try {
      console.log('👤 Received user info from:', sender);

      if (!user?.id || !sender?.id) return;
      // Tạo hoặc lấy room giữa 2 user
      const room = await getRoomByMember(user.id, sender.id);
      
      console.log('✅ Room created/found:', room.id);
      // lưu thông tin receiver
      await updateDeviceAddress(sender?.deviceAddress || '');
      sender.deviceAddress = receiverAddress;
      await createUser(sender);
      // Lưu room info vào ref
      roomInfoRef.current[receiverAddress] = {
        roomId: room.id,
        receiver: sender,
      };

      // Gửi lại ROOM_INFO và thông tin user cho bên kia dưới dạng JSON
      const roomInfoData = {
        type: 'ROOM_INFO',
        room,
        user: {
          id: user.id,
          name: user.name,
          image: user?.image,
          deviceAddress: receiverAddress,
        },
      };
      await BluetoothModule.sendMessageToAll(JSON.stringify(roomInfoData));
      handleNavigateToChat(roomInfoRef.current[receiverAddress]);
      console.log('📤 Sent room info back:', room.id);
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
      if (!room || !receiver) {
        console.error('Invalid room or receiver data');
        return;
      }
      await createRoom(room);
      console.log('🏠 Received room info:', room, receiver);

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
      await createUser(receiver);
      handleNavigateToChat(roomInfoRef.current[receiverAddress]);
      console.log('✅ Room info saved for:', receiverAddress);
    } catch (error) {
      console.error('❌ Error handling room info:', error);
    }
  };

  const handleMessageReceived = async (data: any) => {
    console.log('📩 Message received data:', data);
    const {message, senderName, deviceAddress} = data;

    console.log('📩 Received message in index:', message);
    let jsonData;
    // Thử parse JSON trước
    try {
      jsonData = JSON.parse(message);

      // Xử lý USER_INFO protocol
      if (jsonData.type === 'USER_INFO') {
        await handleUserInfo(jsonData.user, deviceAddress);
        return;
      }

      // Xử lý ROOM_INFO protocol
      if (jsonData.type === 'ROOM_INFO') {
        handleRoomInfo(jsonData.room, jsonData.user, deviceAddress);
        return;
      }
    } catch (e) {
      // Không phải JSON, xử lý như protocol cũ
    }

    // Xử lý tin nhắn ảnh (vẫn dùng protocol cũ)
    if (message.startsWith('IMG_START|')) {
      handleImageStart(message, senderName, deviceAddress);
    } else if (message.startsWith('IMG_CHUNK|')) {
      handleImageChunk(message, senderName, deviceAddress);
    } else if (message.startsWith('IMG_END|')) {
      handleImageEnd(message, senderName, deviceAddress);
    } else {
      // Tin nhắn text thông thường
      console.log('📨 Text message from', jsonData);
    }
  };

  const handleImageStart = async (
    message: string,
    senderName: string,
    deviceAddress: string,
  ) => {
    const parts = message.split('|');
    const messageId = parts[1];
    const totalChunks = parseInt(parts[2]);
    const timestamp = parseInt(parts[3]);

    console.log(`📸 Image start: ${messageId}, ${totalChunks} chunks`);

    // Khởi tạo storage cho ảnh
    imageChunksRef.current[messageId] = {
      chunks: new Array(totalChunks).fill(''),
      totalChunks,
      receivedChunks: 0,
      timestamp,
      senderName,
      deviceAddress,
    };

    // Lưu placeholder vào DB với ID cố định
    // await saveMessageToDB({
    //   id: messageId,
    //   message: '📷 Đang nhận ảnh...',
    //   createdAt: new Date(timestamp),
    //   createdBy: {
    //     id: senderAddress,
    //     name: senderName,
    //   },
    //   type: 'text',
    //   status: 'sending',
    // });
  };

  const handleImageChunk = (
    message: string,
    senderName: string,
    senderAddress: string,
  ) => {
    const parts = message.split('|');
    const messageId = parts[1];
    const chunkIndex = parseInt(parts[2]);
    const chunkData = parts[3];

    const imageData = imageChunksRef.current[messageId];
    if (!imageData) {
      console.warn('⚠️ Received chunk for unknown image:', messageId);
      return;
    }

    // Lưu chunk
    imageData.chunks[chunkIndex] = chunkData;
    imageData.receivedChunks++;

    const progress = Math.round(
      (imageData.receivedChunks / imageData.totalChunks) * 100,
    );

    console.log(
      `📦 Chunk ${chunkIndex + 1}/${imageData.totalChunks} (${progress}%)`,
    );
  };

  const handleImageEnd = async (
    message: string,
    senderName: string,
    senderAddress: string,
  ) => {
    const parts = message.split('|');
    const messageId = parts[1];

    const imageData = imageChunksRef.current[messageId];
    if (!imageData) {
      console.warn('⚠️ Received end for unknown image:', messageId);
      return;
    }

    // Ghép tất cả chunks
    const base64Image = imageData.chunks.join('');

    console.log(
      `✅ Image received: ${messageId}, ${(base64Image.length / 1024).toFixed(
        1,
      )}KB`,
    );
    const {width, height} = await getSizeImage(
      `data:image/jpeg;base64,${base64Image}`,
    );

    // Cập nhật message trong DB với ảnh hoàn chỉnh
    try {
      const currentUserId = user?.id;
      const senderId = imageData.deviceAddress;

      if (!currentUserId || !senderId) {
        console.error('❌ Missing user IDs');
        return;
      }

      const room = await getRoomByMember(currentUserId, senderId);

      await createMessage({
        id: messageId,
        message: `data:image/jpeg;base64,${base64Image}`,
        createdAt: new Date(imageData.timestamp),
        createdBy: {
          id: senderId,
          name: imageData.senderName,
        },
        type: 'image',
        width,
        height,
        roomId: room.id,
        created_by: senderId,
        status: 'delivered',
      });

      console.log('✅ Image saved to DB:', messageId);
    } catch (error) {
      console.error('❌ Error saving image to DB:', error);
    }

    // Xóa khỏi ref
    delete imageChunksRef.current[messageId];
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

    // Listener: Ảnh nhận được (từ protocol Base64 cũ nếu có)
    // const imageReceivedListener = BluetoothModule.addEventListener(
    //   'onImageReceived',
    //   async (data: any) => {
    //     console.log('📸 Image received:', data.filePath);
    //     await saveMessageToDB({
    //       message: `file://${data.filePath}`,
    //       createdAt: new Date(),
    //       createdBy: {
    //         id: data.deviceAddress,
    //         name: data.deviceName,
    //       },
    //       type: 'image',
    //       status: 'delivered',
    //     });
    //   },
    // );

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

        // Gửi thông tin user qua Bluetooth ngay sau khi kết nối (dưới dạng JSON)
        if (user?.id) {
          try {
            const userInfoData = {
              type: 'USER_INFO',
              user: {
                id: user.id,
                name: user.name,
                image: user.image,
                deviceAddress:info.deviceAddress,
              },
            };
            await BluetoothModule.sendMessageToAll(
              JSON.stringify(userInfoData),
            );
            console.log('📤 Sent user info:', user.name);
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
  const handleNavigateToChat = useCallback(async (roomInfo: RoomInfo) => {
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
