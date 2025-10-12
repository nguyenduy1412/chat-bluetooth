
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { navigationRef } from "../../utils/navigationUtils";
import AuthStack from "../../app/(auth)/_layout";
import TabStack from "../../app/(tabs)/_layout";
import MainStack from "./MainStack";


const RootNavigation = () => {
  
  return (
    <NavigationContainer ref={navigationRef}>
      {/* <AuthStack /> */}
      <MainStack />
      {/* {isLogin ? <MainStack /> : <AuthStack />}
      {isLoading && <Loading />} */}
    </NavigationContainer>
  );
};

export default RootNavigation;
