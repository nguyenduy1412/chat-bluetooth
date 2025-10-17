import {Dimensions, StyleSheet} from 'react-native';
import {Box} from '../../../components/common/Layout/Box';
import {Text} from '../../../components/common/Text/Text';
import {useRef} from 'react';
import LottieView from 'lottie-react-native';
import {
  HOME_ICON,
  LOGOUT_ICON,
  MAP_ICON,
  PROFILE_ICON,
  ROBOT_ICON,
} from '../../../assets/animation';
import {colors} from '../../../theme/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {useSharedValue} from 'react-native-reanimated';
import BlueShimmerBar from '../../../features/settings/components/BlueShimmerBar';
import {navigate} from '../../../utils/navigationUtils';
import { ItemSetting } from '../../../features/settings/types';
import ScreenHeader from '../../../components/header/ScreenHeader';

const width = Dimensions.get('window').width - 60;
const renderItem = ({item}: {item: ItemSetting}) => {
  const animation = useRef<LottieView>(null);
  return (
    <Box key={item.id} onPress={item.onPress}>
      <Box flexDirection="row" alignItems="center" gap={5} mb={5}>
        <Box
          overflow="hidden"
          width={70}
          height={60}
          justifyContent="center"
          alignItems="center">
          <LottieView
            ref={animation}
            source={item.icon}
            autoPlay
            loop
            style={{width: item.size, height: item.size}}
          />
        </Box>
        <Box>
          <Text fontSize={16} fontWeight="bold">
            {item.title}
          </Text>
        </Box>
      </Box>
      <BlueShimmerBar w={width} />
    </Box>
  );
};

const data: ItemSetting[] = [
  {
    id: '1',
    title: 'Trợ lý ảo',
    icon: ROBOT_ICON,
    size: 80,
    onPress: () => {
      navigate('SettingStack', {
        screen: 'Model',
      });
    }
  },
  {
    id: '2',
    title: 'Bản đồ',
    icon: MAP_ICON,
    size: 60,
    onPress:()=>{
      navigate('SettingStack', {
        screen: 'Map',
      });
    }
  },
  {
    id: '3',
    title: 'Thông tin cá nhân',
    icon: PROFILE_ICON,
    size: 60,
  },
  {
    id: '4',
    title: 'Đăng xuất',
    icon: LOGOUT_ICON,
    size: 70,
  },
];
const SettingsScreen = () => {
  const {top, bottom} = useSafeAreaInsets();
  return (
    <Box px={20} pt={top}>
      <ScreenHeader title="Cài đặt" isShowBackButton={false} />
      <Box gap={15} backgroundColor={colors.white} borderRadius={25} p={10}>
        {data.map(item => renderItem({item}))}
      </Box>
    </Box>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({});
