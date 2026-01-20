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
import {goBack, navigate} from '../../../utils/navigationUtils';
import {formatName} from '../../../features/chat/utils/formatName';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootNavigatorParamList} from '../../../types/navigation-type';
import {MessageEntity} from '@/database/entities/MessageEntity';
import {userStore} from '@/store/userStore';
import {useGetMessagesByRoomId} from '@/features/chat/hooks/useGetMessagesByRoomId';
import {createMessage} from '@/features/chat/api/createMessage';
import {v4} from 'uuid';
import HeaderChat from '@/features/chat/components/HeaderChat';

interface BluetoothDevice {
  name: string;
  address: string;
  paired?: boolean;
}
type DeviceProp = {
  name: string;
};
const MessageScreen = () => {
  const route = useRoute<RouteProp<RootNavigatorParamList, 'MessageScreen'>>();
  const {user} = userStore();
  const [bluetoothName, setBluetoothName] = useState<string>('');
  const [bluetoothAddress, setBluetoothAddress] = useState<string>('');
  const [connectedDevices, setConnectedDevices] = useState<BluetoothDevice[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  // Fetch messages từ DB theo roomId
  const {data: messagesFromDB = [], refetch: refetchMessages} = useGetMessagesByRoomId(
    route?.params?.roomId,
  );

  // Polling để cập nhật real-time (mỗi 2 giây)
  useEffect(() => {
    const interval = setInterval(() => {
      refetchMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, [refetchMessages]);

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
    // Chỉ lắng nghe kết nối/ngắt kết nối
    BluetoothModule.addEventListener('onConnected', info => {
      const device: BluetoothDevice = {
        name: info.deviceName,
        address: info.deviceAddress,
        paired: true,
      };
      setConnectedDevices(prev => [...prev, device]);
    });

    BluetoothModule.addEventListener('onDisconnected', info => {
      setConnectedDevices(prev =>
        prev.filter(d => d.address !== info.deviceAddress),
      );
    });
  };

  const handleSendMessage = async (text: string) => {
    if (connectedDevices.length === 0) {
      Alert.alert(
        '⚠️ Chưa kết nối',
        'Vui lòng kết nối với thiết bị khác trước',
      );
      return;
    }

    try {
      // Gửi qua Bluetooth
      await BluetoothModule.sendMessageToAll(text);
      
      // Lưu vào DB
      await createMessage({
        id: v4(),
        message: text,
        createdAt: new Date(),
        createdBy: {
          id: user?.id || bluetoothAddress || 'me',
          name: user?.name || bluetoothName || 'Tôi',
        },
        created_by: user?.id || bluetoothAddress || 'me',
        roomId: route?.params?.roomId || '',
        type: 'text',
        status: 'sent',
      } as any);
      
      // Refetch để cập nhật UI
      refetchMessages();
      
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

        // Lưu vào DB trước khi gửi
        await createMessage({
          id: messageId,
          message: `data:image/jpeg;base64,${base64Image}`,
          createdAt: new Date(timestamp),
          createdBy: {
            id: user?.id || bluetoothAddress || 'me',
            name: user?.name || bluetoothName || 'Tôi',
          },
          created_by: user?.id || bluetoothAddress || 'me',
          type: 'image',
          width,
          height,
          roomId: route?.params?.roomId || '',
          status: 'sending',
        } as any);
        
        // Refetch để hiển thị ngay
        refetchMessages();

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
  const handleSearch = () =>{

  }
  return (
    <Box style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <HeaderChat name={route.params.receiver?.name} onSearch={handleSearch} />

      <CustomChatView
        messages={messagesFromDB}
        currentUserId={user?.id || bluetoothAddress || 'me'}
        currentUserName={user?.name || bluetoothName || 'Tôi'}
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
