import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Mapbox from '@rnmapbox/maps';
import { Box } from '../../../components/common/Layout/Box';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '.';

const Stack = createNativeStackNavigator();

const MapStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Map"
    >
      <Stack.Screen name="Map" component={MapScreen} />
    </Stack.Navigator>
  );
};

export default MapStack;


const styles = StyleSheet.create({
  map: {
    flex: 1
  }
})