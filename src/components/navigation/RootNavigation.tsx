import {NavigationContainer} from '@react-navigation/native';
import {navigationRef} from '../../utils/navigationUtils';
import MainStack from './MainStack';

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
