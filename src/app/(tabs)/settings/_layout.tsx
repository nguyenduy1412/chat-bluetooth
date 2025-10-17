import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '.';
import ModelScreen from './models';
import ListMapScreen from './listmap';
import ProfileScreen from './profile';


const Stack = createNativeStackNavigator();

const SettingsStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Settings"
    >
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Model" component={ModelScreen} />
      <Stack.Screen name="Map" component={ListMapScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default SettingsStack;