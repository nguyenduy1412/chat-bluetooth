import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MessageScreen from './message';
import ListMessageScreen from './index';
import ChatAIScreen from './chat-ai';

const Stack = createNativeStackNavigator();

const ChatStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Message"
    >
      <Stack.Screen name="ListMessage" component={ListMessageScreen} />
      <Stack.Screen name="Message" component={MessageScreen} />
      <Stack.Screen name="ChatAI" component={ChatAIScreen} />
    </Stack.Navigator>
  );
};

export default ChatStack;