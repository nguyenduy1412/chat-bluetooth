import React, { useEffect, useReducer, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Lottie from "lottie-react-native";
import { StyleSheet } from "react-native";


import ChatLayout from "./chat/_layout";

import HomeScreen from ".";
import { AnimatedTabBar } from "../../components/navigation/AnimatedTabBar";
import { CHAT_ICON, HOME_ICON, SETTINGS_ICON, UPLOAD_ICON } from "../../assets/animation";
import { Box } from "lucide-react-native";
import { Text } from "react-native-gesture-handler";
import ListMessageScreen from "./chat";
import SettingsScreen from "./settings";
import MapScreen from "./map";
import useModelStore from "../../store/modelStore";

const Tab = createBottomTabNavigator();

export default function TabStack() {
  const {loadModels} = useModelStore();
  useEffect(() => {
    loadModels();
  }, []);
  return (
    <Tab.Navigator tabBar={(props) => <AnimatedTabBar {...props} />}>
      <Tab.Screen
        name="Home"
        options={{
          // @ts-ignore
          tabBarIcon: ({ ref }) => (
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
          tabBarIcon: ({ ref }) => (
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
          tabBarIcon: ({ ref }) => (
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
          tabBarIcon: ({ ref }) => (
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

const PlaceholderScreen = () => {
  return <Box style={{ flex: 1, backgroundColor: "white" }}>
    <Text>áldfdfdf</Text>
  </Box>;
};

const styles = StyleSheet.create({
  icon: {
    height: 30,
    width: 30,
  },
});
