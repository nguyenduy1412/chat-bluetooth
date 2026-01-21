import {useEffect, useRef} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Lottie from 'lottie-react-native';
import {StyleSheet} from 'react-native';

import HomeScreen from '.';
import {AnimatedTabBar} from '../../components/navigation/AnimatedTabBar';
import {
  CHAT_ICON,
  HOME_ICON,
  SETTINGS_ICON,
  UPLOAD_ICON,
} from '../../assets/animation';
import ListMessageScreen from './chat';
import ChatStack from './chat/_layout';
import SettingsScreen from './settings';
import MapScreen from './map';
import useModelStore from '../../store/modelStore';
import {userStore} from '@/store/userStore';
import {useCreateUser} from '@/features/auth/hooks/useCreateUser';
import {ensureDatabase} from '@/database/dataSource';
import {getUserByAttributes} from '@/features/auth/api/getUserByAttributes';
import {getAllUser} from '@/features/auth/api/getAllUser';
import {MessageRepository} from '@/database/repositories/MessageRepository';
import BluetoothModule from '../../assets/managers/BluetoothModule';
import {getRoomByMember} from '@/features/chat/api/getRoomByMember';
import {createRoom} from '@/features/chat/api/createRoom';
import {navigate} from '@/utils/navigationUtils';
import {useCreateMessage} from '@/features/chat/hooks/useCreateMessage';
import {Room} from '@/database/entities/Room';
import {User} from '@/database/entities/User';
import {v4} from 'uuid';
import {RoomInfo, ImageChunk} from '@/features/chat/types';

const Tab = createBottomTabNavigator();

export default function TabStack() {
  const {loadModels} = useModelStore();
  const {user, setUser} = userStore();
  const {mutateAsync: createUser, isPending} = useCreateUser();
  const {mutateAsync: createMessage} = useCreateMessage();

  const roomInfoRef = useRef<{[deviceAddress: string]: RoomInfo}>({});
  const imageChunksRef = useRef<{[key: string]: ImageChunk}>({});

  // ==================== GLOBAL BLUETOOTH HANDLERS ====================

  const handleNavigateToChat = (roomInfo: RoomInfo) => {
    if (!roomInfo) return;
    console.log('🚀 Navigating to chat room:', roomInfo.roomId);
    navigate('MessageScreen', {
      roomId: roomInfo.roomId,
      receiver: roomInfo.receiver,
    });
  };

  const handleUserInfo = async (sender: User, senderAddress: string) => {
    try {
      const currentUser = userStore.getState().user;
      if (!currentUser?.id || !sender?.id) return;

      console.log('👤 Received USER_INFO from:', sender.name, senderAddress);

      // Create/Update sender in DB - Sanitize data to avoid SQLite errors
      const cleanSender: Partial<User> = {
        id: sender.id,
        name: sender.name,
        image: sender.image || '',
        deviceAddress: senderAddress,
        idDevice: sender.idDevice,
      };

      if (sender.email) cleanSender.email = sender.email;
      if (sender.birthday) cleanSender.birthday = sender.birthday;

      await createUser(cleanSender as User);

      // Get/Create deterministic room
      const room = await getRoomByMember(currentUser.id, sender.id);

      roomInfoRef.current[senderAddress] = {
        roomId: room.id,
        receiver: sender,
      };

      // Reply with ROOM_INFO
      const myAddress = currentUser.deviceAddress || '';
      const roomInfoData = {
        type: 'ROOM_INFO',
        room,
        user: {
          id: currentUser.id,
          name: currentUser.name,
          image: currentUser.image || '',
          deviceAddress: myAddress,
          email: currentUser.email,
        },
      };

      await BluetoothModule.sendMessageToAll(JSON.stringify(roomInfoData));

      // Auto navigate
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
      console.log('🏠 Received ROOM_INFO for room:', room.id);

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

      // Sanitize receiver before creating/updating
      const cleanReceiver: Partial<User> = {
        id: receiver.id,
        name: receiver.name,
        image: receiver.image || '',
        deviceAddress: receiver.deviceAddress,
        idDevice: receiver.idDevice,
      };
      if (receiver.email) cleanReceiver.email = receiver.email;

      await createUser(cleanReceiver as User);
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
          roomId,
          created_by,
          type: 'image',
          status: 'sent',
          width,
          height,
        });
        delete imageChunksRef.current[messageId];
        console.log('📸 Image reassembled and saved');
      } catch (error) {
        console.error('❌ Error saving image message:', error);
      }
    }
  };

  const handleMessageReceived = async (data: any) => {
    const {message, deviceAddress} = data;
    try {
      const jsonData = JSON.parse(message);

      // Handle handshake messages
      if (jsonData.type === 'USER_INFO') {
        await handleUserInfo(jsonData.user, deviceAddress);
        return;
      }

      if (jsonData.type === 'ROOM_INFO') {
        await handleRoomInfo(jsonData.room, jsonData.user, deviceAddress);
        return;
      }

      // Handle Chat messages
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

  useEffect(() => {
    console.log('🎧 Global Bluetooth Listener Mounted');
    const messageListener = BluetoothModule.addEventListener(
      'onMessageReceived',
      async (data: any) => {
        await handleMessageReceived(data);
      },
    );

    return () => {
      messageListener.remove();
    };
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        loadModels();
        await ensureDatabase();
        console.log('✅ Database ready');
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
        component={ChatStack}
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
