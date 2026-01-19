import {StyleSheet, Alert, ActivityIndicator, StatusBar} from 'react-native';
import React, {useCallback, useEffect, useState, useRef} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BluetoothModule from '../../../assets/managers/BluetoothModule';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import {requestPermissions} from '../../../utils/permission';
import {CustomChatView} from '../../../features/chat/components/CustomChatView';
import {getSizeImage} from '../../../utils/getSizeImage';
import {Box} from '../../../components/common/Layout/Box';
import {ArrowLeft} from 'lucide-react-native';
import {colors} from '../../../theme/colors';
import {Text} from '../../../components/common/Text/Text';
import { goBack, navigate } from '../../../utils/navigationUtils';
import { formatName } from '../../../features/chat/utils/formatName';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootNavigatorParamList } from '../../../types/navigation-type';
import { MessageEntity } from '@/database/entities/MessageEntity';

interface BluetoothDevice {
  name: string;
  address: string;
  paired?: boolean;
}
type DeviceProp={
  name: string;
}
const MessageScreen = () => {
  const route = useRoute<RouteProp<RootNavigatorParamList, 'MessageScreen'>>();
  const [messages, setMessages] = useState<MessageEntity[]>([]);
  const [bluetoothName, setBluetoothName] = useState<string>('');
  const [bluetoothAddress, setBluetoothAddress] = useState<string>('');
  const [connectedDevices, setConnectedDevices] = useState<BluetoothDevice[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

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

  useEffect(() => {
    initBluetooth();
    setupBluetoothListeners();

    return () => {
      BluetoothModule.removeAllListeners();
    };
  }, []);

  const initBluetooth = async () => {
    try {
      const name = await BluetoothModule.getBluetoothName();
      const address = await BluetoothModule.getBluetoothAddress();
      setBluetoothName(name);
      setBluetoothAddress(address);

      // Lấy danh sách thiết bị đã kết nối (trả về string[] là addresses)
      const deviceAddresses = await BluetoothModule.getConnectedDevices();
      const devices: BluetoothDevice[] = deviceAddresses.map(addr => ({
        name: 'Connected Device',
        address: addr,
        paired: true,
      }));
      setConnectedDevices(devices);

      console.log('✅ Bluetooth initialized:', name, address);
    } catch (error) {
      console.error('❌ Init Bluetooth error:', error);
    }
  };

  const setupBluetoothListeners = () => {
    // Lắng nghe tin nhắn đến
    BluetoothModule.addEventListener(
      'onMessageReceived',
      handleMessageReceived,
    );

    // Lắng nghe kết nối mới
    BluetoothModule.addEventListener('onConnected', info => {
      const device: BluetoothDevice = {
        name: info.deviceName,
        address: info.deviceAddress,
        paired: true,
      };
      setConnectedDevices(prev => [...prev, device]);
      addSystemMessage(`${info.deviceName} đã kết nối`);
    });

    // Lắng nghe ngắt kết nối
    BluetoothModule.addEventListener('onDisconnected', info => {
      setConnectedDevices(prev =>
        prev.filter(d => d.address !== info.deviceAddress),
      );
      addSystemMessage(`Đã ngắt kết nối`);
    });

    // Lắng nghe nhận ảnh
    BluetoothModule.addEventListener('onImageReceived', data => {
      console.log('📸 Image received:', data.filePath);
      addMessage({
        id: `img_${Date.now()}`,
        message: `file://${data.filePath}`,
        createdAt: new Date(),
        createdBy: {
          id: data.deviceAddress,
          name: data.deviceName,
        },
        type: 'image',
        roomId: route?.params?.roomId || '',
      });
    });
  };

  const handleMessageReceived = (data: any) => {
    const {message, senderName, senderAddress} = data;

    console.log('📩 Received:', message);

    // Xử lý tin nhắn ảnh
    if (message.startsWith('IMG_START|')) {
      handleImageStart(message, senderName, senderAddress);
    } else if (message.startsWith('IMG_CHUNK|')) {
      handleImageChunk(message, senderName, senderAddress);
    } else if (message.startsWith('IMG_END|')) {
      handleImageEnd(message, senderName, senderAddress);
    } else {
      // Tin nhắn text thông thường
      addMessage({
        id: `${senderAddress}_${Date.now()}`,
        message: message,
        createdAt: new Date(),
        createdBy: {
          id: senderAddress,
          name: senderName,
        },
        type: 'text',
        roomId: route?.params?.roomId || '',
      });
    }
  };

  const handleImageStart = (
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

    // Thêm message placeholder
    addMessage({
      id: messageId,
      message: '📷 Đang nhận ảnh...',
      createdAt: new Date(timestamp),
      createdBy: {
        id: senderAddress,
        name: senderName,
      },
      type: 'text',
      roomId: route?.params?.roomId || '',
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

    // Cập nhật progress
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? {...msg, message: `📷 Đang nhận ảnh... ${progress}%`}
          : msg,
      ),
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
    // Cập nhật message với ảnh
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              message: '',
              image: `data:image/jpeg;base64,${base64Image}`,
              width,
              height,
            }
          : msg,
      ),
    );

    // Xóa khỏi ref
    delete imageChunksRef.current[messageId];
  };

  const addMessage = (message: MessageEntity) => {
    setMessages(previousMessages => [message, ...previousMessages]);
  };

  const addSystemMessage = (text: string) => {
    // addMessage({
    //   id: `system_${Date.now()}`,
    //   message: text,
    //   createdAt: new Date(),
    //   user: {
    //     _id: 0,
    //     name: 'System',
    //   },
    //   system: true,
    // });
  };

  const handleSendMessage = async (text: string) => {
    if (connectedDevices.length === 0) {
      Alert.alert(
        '⚠️ Chưa kết nối',
        'Vui lòng kết nối với thiết bị khác trước',
      );
      return;
    }

    const newMessage: MessageEntity = {
      id: `msg_${Date.now()}`,
      message: text,
      createdAt: new Date(),
      createdBy: {
        id: bluetoothAddress || 'me',
        name: bluetoothName || 'Tôi',
      },
      roomId: route?.params?.roomId || '',
      type: 'text',
    };

    try {
      await BluetoothModule.sendMessageToAll(text);
      addMessage(newMessage);
      console.log('✅ Sent message:', text);
    } catch (error: any) {
      console.error('❌ Send error:', error);
      Alert.alert('❌ Lỗi', 'Không thể gửi tin nhắn');
    }
  };

  const pickImage = async () => {
    try {
      if (connectedDevices.length === 0) {
        Alert.alert(
          '⚠️ Chưa kết nối',
          'Vui lòng kết nối với thiết bị khác trước khi gửi ảnh',
        );
        return;
      }

      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert('⚠️ Quyền bị từ chối', 'Cần quyền truy cập ảnh');
        return;
      }

      setIsLoading(true);

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1.0,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        setIsLoading(false);
        return;
      }

      if (result.errorCode) {
        setIsLoading(false);
        Alert.alert('❌ Lỗi', result.errorMessage || 'Không thể chọn ảnh');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        if (!asset.uri) {
          setIsLoading(false);
          Alert.alert('❌ Lỗi', 'Không thể đọc ảnh');
          return;
        }

        // Nén ảnh
        const compressedImage = await ImageResizer.createResizedImage(
          asset.uri,
          asset.width && asset.width > 1920 ? 1920 : asset.width || 1920,
          asset.height && asset.height > 1920 ? 1920 : asset.height || 1920,
          'JPEG',
          60,
          0,
          undefined,
          false,
        );

        const base64Image = await RNFS.readFile(
          compressedImage.uri.replace('file://', ''),
          'base64',
        );

        const messageId = `img_${Date.now()}`;
        const timestamp = Date.now();
        const {width, height} = await getSizeImage(
          `data:image/jpeg;base64,${base64Image}`,
        );

        addMessage({
          id: messageId,
          message: '',
          createdAt: new Date(timestamp),
          createdBy: {
            id: bluetoothAddress || 'me',
            name: bluetoothName || 'Tôi',
          },
          type: 'image',
          width,
          height,
          roomId: route?.params?.roomId || '',
        });

        const TOTAL_CHUNKS = 10;
        const chunkSize = Math.ceil(base64Image.length / TOTAL_CHUNKS);
        const chunks: string[] = [];

        for (let i = 0; i < TOTAL_CHUNKS; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, base64Image.length);
          chunks.push(base64Image.substring(start, end));
        }

        await BluetoothModule.sendMessageToAll(
          `IMG_START|${messageId}|${TOTAL_CHUNKS}|${timestamp}`,
        );
        await new Promise(resolve => setTimeout(resolve, 100));

        for (let i = 0; i < chunks.length; i++) {
          await BluetoothModule.sendMessageToAll(
            `IMG_CHUNK|${messageId}|${i}|${chunks[i]}`,
          );
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        await BluetoothModule.sendMessageToAll(`IMG_END|${messageId}`);

        setIsLoading(false);
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error('❌ Image picker error:', error);
      Alert.alert('❌ Lỗi', error.message || 'Không thể chọn/gửi ảnh');
    }
  };

  return (
    <Box style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <Box
        pt={insets.top + 10}
        backgroundColor={colors.primary}
        px={20}
        pb={20}
        gap={10}
        flexDirection="row"
        alignItems="center"
        onPress={()=>{
          goBack()
        }}
        >
        <ArrowLeft color={colors.white} />
        <Text fontSize={20} color={colors.white}>
          {formatName(route?.params?.name)}
        </Text>
      </Box>

      <CustomChatView
        messages={messages}
        currentUserId={bluetoothAddress || 'me'}
        currentUserName={bluetoothName || 'Tôi'}
        onSend={handleSendMessage}
        onImagePress={pickImage}
        placeholder="Nhập tin nhắn..."
        showImageButton={true}
      />

      {isLoading && (
        <Box style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Đang xử lý ảnh...</Text>
        </Box>
      )}
    </Box>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
});
