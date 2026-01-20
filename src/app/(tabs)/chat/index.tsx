import {useEffect, useState, useCallback, useRef} from 'react';
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
import { getUserByAttributes } from '@/features/auth/api/getUserByAttributes';
import { getRoomByMember } from '@/features/chat/api/getRoomByMember';
import { userStore } from '@/store/userStore';
import { getSizeImage } from '@/utils/getSizeImage';
import { createMessage } from '@/features/chat/api/createMessage';
import { v4 } from 'uuid';

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
  const {user} = userStore();
  const [bluetoothName, setBluetoothName] = useState<string>('');

  // Lưu room info cho mỗi device (key là deviceAddress)
  const roomInfoRef = useRef<{
    [deviceAddress: string]: {
      roomId: string;
      receiver: any;
    };
  }>({});

  const imageChunksRef = useRef<{
    [key: string]: {
      chunks: string[];
      totalChunks: number;
      receivedChunks: number;
      timestamp: number;
      senderName: string;
      senderAddress: string;
    };
  }>({});
  const loadData = async () => {
    try {
    } catch (error) {
      console.error('❌ Load data error:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);
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
      // Kiểm tra xem đã có kết nối với thiết bị này chưa
      const isAlreadyConnected = connectedDevices.some(
        d => d.address === device.address,
      );

      if (isAlreadyConnected) {
        console.log('⚠️ Đã có kết nối với thiết bị này:', device.name);
        Alert.alert(
          '⚠️ Đã kết nối',
          `Bạn đã kết nối với ${device.name} rồi`,
          [{text: 'OK'}],
        );
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
    console.log("disconect")
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

  // ==================== XỬ LÝ TIN NHẮN ====================

  const handleUserInfo = async (message: string, senderName: string, senderAddress: string) => {
    try {
      // Parse JSON: {type: 'USER_INFO', userId, userName, userEmail}
      const data = JSON.parse(message);
      const {userId: remoteUserId, userName: remoteUserName, userEmail: remoteUserEmail = ''} = data;

      console.log('👤 Received user info from:', remoteUserName, remoteUserId);

      if (!user?.id) {
        console.error('❌ Current user not found');
        return;
      }

      // Tạo hoặc lấy room giữa 2 user
      const room = await getRoomByMember(user.id, remoteUserId);
      
      console.log('✅ Room created/found:', room.id);

      // Lưu room info vào ref
      roomInfoRef.current[senderAddress] = {
        roomId: room.id,
        receiver: {
          id: remoteUserId,
          name: remoteUserName,
          email: remoteUserEmail,
        },
      };

      // Gửi lại ROOM_INFO cho bên kia dưới dạng JSON
      const roomInfoData = {
        type: 'ROOM_INFO',
        roomId: room.id,
        userId: user.id,
        userName: user.name || bluetoothName,
        userEmail: user.email || '',
      };
      await BluetoothModule.sendMessageToAll(JSON.stringify(roomInfoData));
      
      console.log('📤 Sent room info back:', room.id);
    } catch (error) {
      console.error('❌ Error handling user info:', error);
    }
  };

  const handleRoomInfo = (message: string, senderAddress: string) => {
    try {
      // Parse JSON: {type: 'ROOM_INFO', roomId, userId, userName, userEmail}
      const data = JSON.parse(message);
      const {roomId, userId: remoteUserId, userName: remoteUserName, userEmail: remoteUserEmail = ''} = data;

      console.log('🏠 Received room info:', roomId);

      // Lưu room info vào ref
      roomInfoRef.current[senderAddress] = {
        roomId,
        receiver: {
          id: remoteUserId,
          name: remoteUserName,
          email: remoteUserEmail,
        },
      };

      console.log('✅ Room info saved for:', senderAddress);
    } catch (error) {
      console.error('❌ Error handling room info:', error);
    }
  };

  const saveMessageToDB = async (messageData: any) => {
    try {
      // Tìm hoặc tạo room cho 2 người (current user và sender)
      const currentUserId = user?.id;
      const senderId = messageData.createdBy?.id || messageData.created_by;
      
      if (!currentUserId || !senderId) {
        console.error('❌ Missing user IDs for room creation');
        return;
      }

      // Lấy hoặc tạo room giữa 2 user
      const room = await getRoomByMember(currentUserId, senderId);
      
      // Lưu message vào DB
      const newMessage = await createMessage({
        id: v4(),
        ...messageData,
        roomId: room.id,
        created_by: senderId,
      } as any);
      
      console.log('✅ Message saved to DB:', newMessage.id);
    } catch (error) {
      console.error('❌ Error saving message to DB:', error);
    }
  };

  const handleMessageReceived = async (data: any) => {
    const {message, senderName, senderAddress} = data;

    console.log('📩 Received message in index:', message);

    // Thử parse JSON trước
    try {
      const jsonData = JSON.parse(message);
      
      // Xử lý USER_INFO protocol
      if (jsonData.type === 'USER_INFO') {
        await handleUserInfo(message, senderName, senderAddress);
        return;
      }

      // Xử lý ROOM_INFO protocol
      if (jsonData.type === 'ROOM_INFO') {
        handleRoomInfo(message, senderAddress);
        return;
      }
    } catch (e) {
      // Không phải JSON, xử lý như protocol cũ
    }

    // Xử lý tin nhắn ảnh (vẫn dùng protocol cũ)
    if (message.startsWith('IMG_START|')) {
      handleImageStart(message, senderName, senderAddress);
    } else if (message.startsWith('IMG_CHUNK|')) {
      handleImageChunk(message, senderName, senderAddress);
    } else if (message.startsWith('IMG_END|')) {
      handleImageEnd(message, senderName, senderAddress);
    } else {
      // Tin nhắn text thông thường
      console.log('📨 Text message from', senderName, ':', message);
      await saveMessageToDB({
        message: message,
        createdAt: new Date(),
        createdBy: {
          id: senderAddress,
          name: senderName,
        },
        type: 'text',
        status: 'delivered',
      });
    }
  };

  const handleImageStart = async (
    message: string,
    senderName: string,
    senderAddress: string,
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
      senderAddress,
    };

    // Lưu placeholder vào DB với ID cố định
    await saveMessageToDB({
      id: messageId,
      message: '📷 Đang nhận ảnh...',
      createdAt: new Date(timestamp),
      createdBy: {
        id: senderAddress,
        name: senderName,
      },
      type: 'text',
      status: 'sending',
    });
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
      const senderId = imageData.senderAddress;
      
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
    const imageReceivedListener = BluetoothModule.addEventListener(
      'onImageReceived',
      async (data: any) => {
        console.log('📸 Image received:', data.filePath);
        await saveMessageToDB({
          message: `file://${data.filePath}`,
          createdAt: new Date(),
          createdBy: {
            id: data.deviceAddress,
            name: data.deviceName,
          },
          type: 'image',
          status: 'delivered',
        });
      },
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

        // Gửi thông tin user qua Bluetooth ngay sau khi kết nối (dưới dạng JSON)
        if (user?.id) {
          try {
            const userInfoData = {
              type: 'USER_INFO',
              userId: user.id,
              userName: user.name || bluetoothName,
              userEmail: user.email || '',
            };
            await BluetoothModule.sendMessageToAll(JSON.stringify(userInfoData));
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
      imageReceivedListener.remove();
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
        // Lấy và lưu bluetooth name
        try {
          const name = await BluetoothModule.getBluetoothName();
          setBluetoothName(name);
        } catch (error) {
          console.error('Error getting bluetooth name:', error);
        }
        
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

  const handleConected = async (
    isConnectedDevice: boolean,
    item: BluetoothDevice,
  ) => {
    console.log('isConnectedDevice', item.name);
    console.log('isConnectedDevice', item.name);
    if (!isConnectedDevice) {
      await connectTo(item);
    } else {
      // Lấy room info từ ref
      const roomInfo = roomInfoRef.current[item.address];
      console.log('roomInfo', roomInfo);
      if (roomInfo) {
        // Đã có room info, navigate với params đầy đủ
        // navigate('ChatStack', {
        //   screen: 'Message',
        //   params: {
        //     roomId: roomInfo.roomId,
        //     receiver: roomInfo.receiver,
        //   },
        // });
      } else {
        // Chưa có room info, chờ 1 chút rồi thử lại
        Alert.alert(
          '⏳ Đang đồng bộ...',
          'Vui lòng chờ giây lát để đồng bộ thông tin room',
          [{
            text: 'OK',
            onPress: () => {
              // Thử lại sau 2s
              setTimeout(() => {
                const updatedRoomInfo = roomInfoRef.current[item.address];
                if (updatedRoomInfo) {
                  console.log('updatedRoomInfo', updatedRoomInfo);
                  // navigate('ChatStack', {
                  //   screen: 'Message',
                  //   params: {
                  //     name: item.name,
                  //     roomId: updatedRoomInfo.roomId,
                  //     receiver: updatedRoomInfo.receiver,
                  //   },
                  // });
                } else {
                  Alert.alert('❌ Lỗi', 'Không thể đồng bộ thông tin room. Vui lòng thử lại.');
                }
              }, 2000);
            }
          }]
        );
      }
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
              backgroundColor={isConnectedDevice ? '#FF3B30' : 'red'}
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

  const handleChatAI = async () => {
    const ai = await getUserByAttributes({ system: true });
    console.log('ai', ai);
    if(!user?.id || !ai?.id) return;
    const room = await getRoomByMember(user?.id,ai?.id)
    navigate('ChatStack', {
      screen: 'ChatAIScreen',
      params:{
        roomId:room.id,
        receiver: ai
      }
    });
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
              onPress={handleChatAI}>
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
