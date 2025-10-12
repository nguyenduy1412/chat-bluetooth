import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MessageScreen from './message';
import ListMessageScreen from './index';

const Stack = createNativeStackNavigator();

const ChatStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Message"
    >
      <Stack.Screen name="ListMessage" component={ListMessageScreen} />
      <Stack.Screen name="Message" component={MessageScreen} />
    </Stack.Navigator>
  );
};

export default ChatStack;