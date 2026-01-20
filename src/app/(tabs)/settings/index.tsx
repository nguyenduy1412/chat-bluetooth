import {Alert, Dimensions, StyleSheet} from 'react-native';
import {Box} from '../../../components/common/Layout/Box';
import {Text} from '../../../components/common/Text/Text';
import {useRef} from 'react';
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
import ScreenHeader from '../../../components/header/ScreenHeader';
import {
  confirmPlatformPayPayment,
  PlatformPay,
} from '@stripe/stripe-react-native';
import {STRIPE_PUBLISHABLE_KEY, SUPABASE_FUNCTIONS, SUPABASE_ANON_KEY} from '@/constant';
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
    title: 'Đăng xuất',
    icon: LOGOUT_ICON,
    size: 70,
  },
];
const SettingsScreen = () => {
  const {top, bottom} = useSafeAreaInsets();
  const fetchPaymentIntentClientSecret = async () => {
    console.log('🔑 Client Publishable Key:', STRIPE_PUBLISHABLE_KEY);
    console.log('📞 Calling Supabase Edge Function...');
    
    const response = await fetch(
      SUPABASE_FUNCTIONS.CREATE_PAYMENT_INTENT,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount: 50000,
          currency: 'vnd',
        }),
      },
    );
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('📦 Supabase response:', data);
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.clientSecret;
  };
  const pay = async () => {
    try {
      const clientSecret = await fetchPaymentIntentClientSecret();
      console.log('Client Secret:', clientSecret);
      
      if (!clientSecret) {
        Alert.alert('Error', 'Failed to get payment intent');
        return;
      }

      const {error, paymentIntent} = await confirmPlatformPayPayment(
        clientSecret,
        {
          googlePay: {
            testEnv: true,
            merchantName: 'Kaizer',
            merchantCountryCode: 'VN',
            currencyCode: 'VND',
            billingAddressConfig: {
              format: PlatformPay.BillingAddressFormat.Full,
              isPhoneNumberRequired: true,
              isRequired: true,
            },
          },
        },
      );

      if (error) {
        console.error('Payment error:', error);
        Alert.alert(error.code, error.message);
        return;
      }
      
      Alert.alert('Success', 'The payment was confirmed successfully.');
      console.log(JSON.stringify(paymentIntent, null, 2));
    } catch (err:any) {
      console.error('Payment failed:', err);
      Alert.alert('Error', err.message || 'Payment failed');
    }
  };
  return (
    <Box px={20} pt={top}>
      <ScreenHeader title="Cài đặt" isShowBackButton={false} />
      <Box gap={15} backgroundColor={colors.white} borderRadius={25} p={10}>
        {data.map(item => renderItem({item}))}
        <Box
          backgroundColor={'red'}
          w={100}
          h={100}
          alignItems="center"
          justifyContent="center"
          onPress={pay}>
          <Text fontSize={16} fontWeight="bold" color={'black'}>
            Pay
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({});
