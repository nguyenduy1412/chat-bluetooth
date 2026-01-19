import {useEffect} from 'react';
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
import SettingsScreen from './settings';
import MapScreen from './map';
import useModelStore from '../../store/modelStore';
import {userStore} from '@/store/userStore';
import {useCreateUser} from '@/features/auth/hooks/useCreateUser';
import {ensureDatabase} from '@/database/dataSource';
import {getUserByAttributes} from '@/features/auth/api/getUserByAttributes';
import { getAllUser } from '@/features/auth/api/getAllUser';
import { MessageRepository } from '@/database/repositories/MessageRepository';

const Tab = createBottomTabNavigator();

export default function TabStack() {
  const {loadModels} = useModelStore();
  const {user, setUser} = userStore();
  const {mutateAsync: createUser, isPending} = useCreateUser();

  useEffect(() => {
    const initialize = async () => {
      try {

        loadModels();
        await ensureDatabase();
        console.log('✅ Database ready', user);
        const listUser= await getAllUser();
        const messageRepo = new MessageRepository();
        const allMessages = await messageRepo.findAll();
        console.log('✅ All messages:', allMessages);
        console.log('✅ List users:', listUser);
        if (user) {
          const userDB = await getUserByAttributes({idDevice: user?.idDevice});
          console.log('userDB', userDB);
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
