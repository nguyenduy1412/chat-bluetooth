import {Dimensions, StyleSheet} from 'react-native';
import {Box} from '../../../components/common/Layout/Box';
import {Text} from '../../../components/common/Text/Text';
import {useRef, useState} from 'react';
import LottieView from 'lottie-react-native';
import {
  LOGOUT_ICON,
  MAP_ICON,
  PROFILE_ICON,
  ROBOT_ICON,
} from '../../../assets/animation';
import {colors} from '../../../theme/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BlueShimmerBar from '../../../features/settings/components/BlueShimmerBar';
import {navigate} from '../../../utils/navigationUtils';
import {ItemSetting} from '../../../features/settings/types';
import PaymentModal from '@/features/settings/components/PaymentModal';

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
    },
  },
  {
    id: '2',
    title: 'Bản đồ',
    icon: MAP_ICON,
    size: 60,
    onPress: () => {
      navigate('SettingStack', {
        screen: 'Map',
      });
    },
  },
  {
    id: '3',
    title: 'Thông tin cá nhân',
    icon: PROFILE_ICON,
    size: 60,
    onPress: () => {
      navigate('SettingStack', {
        screen: 'Profile',
      });
    },
  },
  {
    id: '4',
    title: 'Đồng bộ dữ liệu',
    icon: LOGOUT_ICON,
    size: 70,
  },
];

const SettingsScreen = () => {
  const {top} = useSafeAreaInsets();
  const [showPayment, setShowPayment] = useState(false);

  return (
    <Box px={20} pt={top} backgroundColor={colors.background} flex={1}>
      <Box
        gap={15}
        backgroundColor={colors.white}
        borderRadius={24}
        p={10}
        py={20}
        style={{
          elevation: 0,
        }}>
        <Text fontSize={25} fontWeight="bold" color={'#2563eb'}>
          {'Cài đặt'.toUpperCase()}
        </Text>
        {data.map(item => renderItem({item}))}
        <Box
          backgroundColor={'red'}
          w={100}
          h={100}
          alignItems="center"
          justifyContent="center"
          onPress={() => setShowPayment(true)}>
          <Text fontSize={16} fontWeight="bold" color={'black'}>
            Pay
          </Text>
        </Box>
        <PaymentModal
          visible={showPayment}
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={() => {
            console.log('Payment successful!');
            // Xử lý sau khi thanh toán thành công
          }}
          onPaymentError={error => {
            console.log('Payment error:', error);
            // Xử lý khi thanh toán lỗi
          }}
        />
      </Box>
    </Box>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({});
