import {useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Lottie from 'lottie-react-native';
import {Alert, StyleSheet} from 'react-native';

import HomeScreen from '.';
import {AnimatedTabBar} from '../../components/navigation/AnimatedTabBar';
import {
  CHAT_ICON,
  HOME_ICON,
  SETTINGS_ICON,
  UPLOAD_ICON,
} from '../../assets/animation';
import ListMessageScreen from './chat';
import SettingsScreen from './settings';
import MapScreen from './map';
import useModelStore from '../../store/modelStore';
import {userStore} from '@/store/userStore';
import {useCreateUser} from '@/features/auth/hooks/useCreateUser';
import {ensureDatabase} from '@/database/dataSource';
import {getUserByAttributes} from '@/features/auth/api/getUserByAttributes';
import {getAllUser} from '@/features/auth/api/getAllUser';
import {MessageRepository} from '@/database/repositories/MessageRepository';
import {useBluetooth} from '@/features/chat/hooks/useBluetooth';
import BluetoothModule from '@/assets/managers/BluetoothModule';
import {BluetoothDevice} from '@/features/chat/types';

const Tab = createBottomTabNavigator();

export default function TabStack() {
  const {loadModels} = useModelStore();
  const {user, setUser} = userStore();
  const {mutateAsync: createUser, isPending} = useCreateUser();

  // State để track database đã sẵn sàng chưa
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  // State để track Bluetooth đã sẵn sàng (đã có quyền) chưa
  const [isBluetoothReady, setIsBluetoothReady] = useState(false);

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
    handleUserInfo,
    roomInfoRef,
    handleRoomInfo,
    handleMessageReceived,
    handleRoomPress,
    roomsRef,
    setIsBluetoothOn,
  } = useBluetooth({isDatabaseReady});

  useEffect(() => {
    const initialize = async () => {
      try {
        loadModels();
        await ensureDatabase();
        console.log('✅ Database ready');
        // Đánh dấu database đã sẵn sàng
        setIsDatabaseReady(true);

        const listUser = await getAllUser();
        const messageRepo = new MessageRepository();
        const allMessages = await messageRepo.findAll();
        console.log('✅ All messages:', allMessages);
        console.log('✅ List users:', listUser);
        if (user) {
          const userDB = await getUserByAttributes({idDevice: user?.idDevice});
          if (!userDB) {
            console.log('Creating new user...');
            await createUser(user);
          } else {
            setUser(userDB);
          }
        } else {
          console.log('Creating new user2...');
          const res = await createUser({
            name: 'BLEUser',
          });
          console.log('✅ User created:', res);
          setUser(res);
        }
      } catch (error) {
        console.error('❌ Initialization error:', error);
      }
    };

    initialize();
  }, []);

  // useEffect thứ 2: Xin quyền Bluetooth và enable
  useEffect(() => {
    const init = async () => {
      const enabled = await checkAndEnableBluetooth();
      setIsBluetoothOn(!!enabled);

      if (enabled) {
        await autoRename();
        await initializeBluetoothServer();
        startDiscovery();
        // Đánh dấu Bluetooth đã sẵn sàng SAU KHI tất cả operations thành công
        setIsBluetoothReady(true);
      }
    };
    init();
  }, []);

  // useEffect thứ 3: Chỉ đăng ký listeners KHI Bluetooth đã sẵn sàng
  useEffect(() => {
    // Không làm gì nếu Bluetooth chưa sẵn sàng
    if (!isBluetoothReady) {
      return;
    }

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
  }, [isBluetoothReady]); // Chỉ đăng ký listeners khi Bluetooth đã sẵn sàng
  return (
    <Tab.Navigator tabBar={props => <AnimatedTabBar {...props} />}>
      <Tab.Screen
        name="Home"
        options={{
          // @ts-ignore
          tabBarIcon: ({ref}) => (
            <Lottie
              ref={ref}
              loop={false}
              source={HOME_ICON}
              style={styles.icon}
            />
          ),
          headerShown: false,
        }}
        component={HomeScreen}
      />
      <Tab.Screen
        name="Upload"
        options={{
          // @ts-ignore
          tabBarIcon: ({ref}) => (
            <Lottie
              ref={ref}
              loop={false}
              source={UPLOAD_ICON}
              style={styles.icon}
            />
          ),
          headerShown: false,
        }}
        component={MapScreen}
      />
      <Tab.Screen
        name="Chat"
        options={{
          // @ts-ignore
          tabBarIcon: ({ref}) => (
            <Lottie
              ref={ref}
              loop={false}
              source={CHAT_ICON}
              style={styles.icon}
            />
          ),
          headerShown: false,
        }}
        component={ListMessageScreen}
      />
      <Tab.Screen
        name="Settings"
        options={{
          // @ts-ignore
          tabBarIcon: ({ref}) => (
            <Lottie
              ref={ref}
              loop={false}
              source={SETTINGS_ICON}
              style={styles.icon}
            />
          ),
          headerShown: false,
        }}
        component={SettingsScreen}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {
    height: 30,
    width: 30,
  },
});
