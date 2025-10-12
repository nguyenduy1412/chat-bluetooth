import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '.';
import { RootNavigatorParamList } from '../../types/navigation-type';
const Stack = createNativeStackNavigator<RootNavigatorParamList>();

export default function AuthStack() {
  // const { isSignedIn, isLoaded } = useAuth();

  // useEffect(() => {
  //   // if (isLoaded && isSignedIn) {
  //   //   router.replace('/(tabs)');
  //   // }
  //   router.replace('/(tabs)');
  // }, [ router]);

  // if (!isLoaded) {
  //   return null;
  // }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={'Login'}>
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* <Stack.Screen name="Password" component={Password} /> */}
      {/* <Stack.Screen name="RegisterPassword" component={RegisterPassword} /> */}
      {/* <Stack.Screen name="Otp" component={Otp} />
      <Stack.Screen name="RegisterInfo" component={RegisterInfo} />
      <Stack.Screen name="Pending" component={Pending} />
      <Stack.Screen name="UploadAvatar" component={UploadAvatar} />
      <Stack.Screen name="ForgetPasswordOtp" component={ForgetPasswordOtp} />
      <Stack.Screen name="NewPassword" component={NewPassword} />
      <Stack.Screen name="CommonWebView" component={CommonWebView} /> */}
    </Stack.Navigator>
  );
}
