import {Alert} from 'react-native';
import BluetoothModule from '../../../assets/managers/BluetoothModule';
import {useCallback, useEffect, useRef, useState} from 'react';
import {
  BluetoothDevice,
  ConnectedDevice,
  ImageChunk,
  RoomInfo,
  RoomResponse,
} from '../types';
import {useUpdateUser} from '@/features/auth/hooks/useUpdateUser';
import {userStore} from '@/store/userStore';
import {getRoomByMember} from '../api/getRoomByMember';
import {User} from '@/database/entities/User';
import {useCreateUser} from '@/features/auth/hooks/useCreateUser';
import {useCreateMessage} from './useCreateMessage';
import {navigate} from '@/utils/navigationUtils';
import {Room} from '@/database/entities/Room';
import {useCreateRoom} from './useCreateRoom';
import {useGetRoomsByUserId} from './useGetRoomsByUserId';
import {requestPermissions} from '@/utils/permission';

type UseBluetoothOptions = {
  isDatabaseReady?: boolean;
};

export const useBluetooth = (options: UseBluetoothOptions = {}) => {
  const {isDatabaseReady = false} = options;

  const [isEnabled, setIsEnabled] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>(
    [],
  );
  const {user, setUser} = userStore();
  const {mutateAsync: createUser} = useCreateUser();
  const {mutateAsync: updateUser, isPending: isUpdating} = useUpdateUser();
  const {mutateAsync: createMessage} = useCreateMessage();
  const {mutateAsync: createRoom} = useCreateRoom();
  const roomInfoRef = useRef<{[deviceAddress: string]: RoomInfo}>({});
  const imageChunksRef = useRef<{[key: string]: ImageChunk}>({});
  const {
    data: rooms = [],
    isLoading: isLoadingRooms,
    refetch: refetchRooms,
  } = useGetRoomsByUserId({
    id: user?.id || '',
    queryConfig: {
      // Chỉ enable query khi CẢ database lẫn user đều ready
      enabled: isDatabaseReady && !!user?.id,
    },
  });

  const roomsRef = useRef(rooms);
  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  const checkAndEnableBluetooth = async () => {
    try {
      // 1. XIN QUYỀN TRƯỚC - đây là bước quan trọng nhất trên Android 12+
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          '❌ Thiếu quyền',
          'Vui lòng cấp quyền Bluetooth để sử dụng tính năng này',
        );
        return false;
      }

      // 2. Kiểm tra thiết bị hỗ trợ Bluetooth
      const available = await BluetoothModule.isBluetoothAvailable();
      if (!available) {
        Alert.alert('❌ Lỗi', 'Thiết bị không hỗ trợ Bluetooth');
        return false;
      }

      // 3. Kiểm tra Bluetooth đã bật chưa
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
      // Clear devices list to start fresh scan
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

      // Stop discovery before connecting to ensure stability
      await BluetoothModule.stopDiscovery();
      setDiscovering(false);

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
      const enabled = await BluetoothModule.isBluetoothEnabled();
      if (!enabled) return;

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

      const userUpdated = await updateUser({
        id: user.id,
        data: {deviceAddress},
      });
      setUser(userUpdated);
      console.log('✅ Cập nhật địa chỉ Bluetooth thành công:', deviceAddress);
    } catch (err) {
      console.error('❌ Lỗi khi cập nhật địa chỉ Bluetooth:', err);
    }
  };

  const handleNavigateToChat = useCallback((roomInfo: RoomInfo) => {
    navigate('ChatStack', {
      screen: 'Message',
      params: {
        roomId: roomInfo.roomId,
        receiver: roomInfo.receiver,
      },
    });
  }, []);

  const handleUserInfo = async (sender: User, senderAddress: string) => {
    try {
      if (!user?.id || !sender?.id) return;

      await updateDeviceAddress(sender?.deviceAddress || '');
      const room = await getRoomByMember(user.id, sender.id);

      sender.deviceAddress = senderAddress;
      const userCreated = await createUser(sender);

      roomInfoRef.current[senderAddress] = {
        roomId: room.id,
        receiver: userCreated,
      };

      const roomInfoData = {
        type: 'ROOM_INFO',
        room,
        user: {
          id: user.id,
          name: user.name,
          image: user?.image || '',
          deviceAddress: user.deviceAddress,
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
  const handleRoomPress = useCallback((roomResponse: RoomResponse) => {
    navigate('ChatStack', {
      screen: 'Message',
      params: {
        roomId: roomResponse.id,
        receiver: roomResponse.receiver,
      },
    });
  }, []);
  const onRefresh = useCallback(() => {
    refetchRooms();
    console.log('isBluetoothOn', isEnabled);
    if (isEnabled) {
      startDiscovery();
    }
  }, [refetchRooms, startDiscovery]);
  const handleToggleBluetooth = async (value: boolean) => {
    setIsEnabled(value);
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
    handleUserInfo,
    roomInfoRef,
    handleRoomInfo,
    handleMessageReceived,
    handleRoomPress,
    rooms,
    isLoadingRooms,
    refetchRooms,
    roomsRef,
    imageChunksRef,
    onRefresh,
    handleToggleBluetooth,
    setIsEnabled,
  };
};
