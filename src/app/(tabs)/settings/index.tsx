import {ActivityIndicator, Alert, Dimensions, StyleSheet} from 'react-native';
import {Box} from '../../../components/common/Layout/Box';
import {Text} from '../../../components/common/Text/Text';
import {useRef, useState} from 'react';
import LottieView from 'lottie-react-native';
import {
  LOGOUT_ICON,
  MAP_ICON,
  PROFILE_ICON,
  ROBOT_ICON,
  UPLOAD_ICON,
} from '../../../assets/animation';
import {colors} from '../../../theme/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BlueShimmerBar from '../../../features/settings/components/BlueShimmerBar';
import {navigate} from '../../../utils/navigationUtils';
import {ItemSetting} from '../../../features/settings/types';
import PaymentModal from '@/features/settings/components/PaymentModal';

const width = Dimensions.get('window').width - 60;

const RenderItem = ({
  item,
  isSyncing,
}: {
  item: ItemSetting;
  isSyncing?: boolean;
}) => {
  const animation = useRef<LottieView>(null);
  const isDisabled = item.id === '4' && isSyncing;

  return (
    <Box key={item.id} onPress={isDisabled ? undefined : item.onPress}>
      <Box flexDirection="row" alignItems="center" gap={5} mb={5}>
        <Box
          overflow="hidden"
          width={70}
          height={60}
          justifyContent="center"
          alignItems="center">
          {item.id === '4' && isSyncing ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : (
            <LottieView
              ref={animation}
              source={item.icon}
              autoPlay
              loop
              style={{width: item.size, height: item.size}}
            />
          )}
        </Box>
        <Box flex={1}>
          <Text fontSize={16} fontWeight="bold">
            {item.id === '4' && isSyncing ? 'Đang xử lý...' : item.title}
          </Text>
        </Box>
      </Box>
      <BlueShimmerBar w={width} />
    </Box>
  );
};

// Import necessary services
import {syncAll, restoreAccount} from '@/services/supabaseSync';
import {UserRepository} from '@/database/repositories/UserRepository';
import {userStore} from '@/store/userStore';

const SettingsScreen = () => {
  const {top} = useSafeAreaInsets();
  const [showPayment, setShowPayment] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const {user} = userStore();
  // Repositories
  const userRepository = new UserRepository();

  const handleBackup = async () => {
    try {
      setIsSyncing(true);

      // 1. Check if ANY user has email
      const users = await userRepository.findAll();
      const currentUser = users[0]; // Assuming single user app usually, or pick active

      if (!currentUser?.email) {
        Alert.prompt(
          'Email Required',
          'Vui lòng nhập email để sao lưu dữ liệu',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setIsSyncing(false),
            },
            {
              text: 'Save & Backup',
              onPress: async email => {
                if (!email) {
                  setIsSyncing(false);
                  return;
                }
                // Save email to local user
                if (currentUser) {
                  await userRepository.update(currentUser.id!, {email});
                  // Proceed to backup
                  await performBackup();
                } else {
                  Alert.alert('Error', 'Không tìm thấy user local');
                  setIsSyncing(false);
                }
              },
            },
          ],
          'plain-text',
          '',
        );
      } else {
        await performBackup();
      }
    } catch (error) {
      console.error(error);
      setIsSyncing(false);
    }
  };

  const performBackup = async () => {
    try {
      const result = await syncAll();
      Alert.alert(
        '✅ Sao lưu thành công',
        `Đã đồng bộ lên Cloud:\nUsers: ${result.users.success}\nRooms: ${result.rooms.success}\nMessages: ${result.messages.success}`,
      );
    } catch (e) {
      Alert.alert('❌ Lỗi', 'Sao lưu thất bại');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestore = () => {
    Alert.prompt(
      'Khôi phục dữ liệu',
      'Nhập email tài khoản cũ để khôi phục. ⚠️ Dữ liệu hiện tại trên máy sẽ bị XÓA!',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Restore',
          onPress: async () => {
            console.log('33333');
            if (!user?.email) return;
            setIsSyncing(true);
            try {
              const success = await restoreAccount(user.email);
              if (success) {
                Alert.alert(
                  '✅ Thành công',
                  'Dữ liệu đã được khôi phục. Vui lòng khởi động lại app.',
                );
                // Optional: Reload app logic here
              } else {
                Alert.alert(
                  '❌ Thất bại',
                  'Không tìm thấy tài khoản hoặc lỗi mạng',
                );
              }
            } catch (e) {
              Alert.alert('❌ Lỗi', 'Có lỗi xảy ra khi khôi phục');
            } finally {
              setIsSyncing(false);
            }
          },
        },
      ],
      'plain-text',
    );
  };

  const handleSyncOption = () => {
    Alert.alert('Đồng bộ dữ liệu', 'Chọn hành động bạn muốn thực hiện:', [
      {text: 'Hủy', style: 'cancel'},
      {text: '☁️ Sao lưu (Backup)', onPress: handleBackup},
      {
        text: '📥 Khôi phục (Restore)',
        onPress: handleRestore,
        style: 'destructive',
      },
    ]);
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
      title: 'Sao lưu & Khôi phục',
      icon: UPLOAD_ICON,
      size: 70,
      onPress: () => {
        navigate('SettingStack', {
          screen: 'Sync',
        });
      },
    },
  ];

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
        {data.map(item => (
          <RenderItem key={item.id} item={item} isSyncing={isSyncing} />
        ))}
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
