import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { RootNavigatorParamList } from '../../types/navigation-type';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from '../../app/(auth)/_layout';
import TabStack from '../../app/(tabs)/_layout';
import ChatStack from '../../app/(tabs)/chat/_layout';
import SettingsStack from '../../app/(tabs)/settings/_layout';
const Stack = createNativeStackNavigator<RootNavigatorParamList>();
const MainStack = () => {
  return (
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="TabStack">
        <Stack.Screen name="AuthStack" component={AuthStack} />
        <Stack.Screen name="TabStack" component={TabStack} />
        <Stack.Screen name="ChatStack" component={ChatStack} />
        <Stack.Screen name="SettingStack" component={SettingsStack} />
      </Stack.Navigator>
  )
}

export default MainStack

const styles = StyleSheet.create({})