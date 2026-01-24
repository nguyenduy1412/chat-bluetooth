import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../../theme/colors';
import {Box} from '../../../components/common/Layout/Box';
import {goBack} from '../../../utils/navigationUtils';
import {Ionicons} from '@expo/vector-icons';
import {userStore} from '@/store/userStore';
import {UserRepository} from '@/database/repositories/UserRepository';
import {syncAll, restoreAccount} from '@/services/supabaseSync';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';

const SyncScreen = () => {
  const {top} = useSafeAreaInsets();
  const {user, setUser} = userStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const userRepository = new UserRepository();

  useEffect(() => {
    const loadUserEmail = async () => {
      const users = await userRepository.findAll();
      const currentUser = users[0];
      if (currentUser?.email) {
        setEmail(currentUser.email);
      } else if (user?.email) {
        setEmail(user.email);
      }
    };
    loadUserEmail();
  }, []);

  const handleBackup = async () => {
    if (!email.trim() || !validateEmail(email)) {
      Alert.alert('Email không hợp lệ', 'Vui lòng nhập đúng định dạng email');
      return;
    }

    setIsLoading(true);
    setStatus('Đang sao lưu...');

    try {
      // Save email to local first
      const users = await userRepository.findAll();
      const currentUser = users[0];
      if (currentUser) {
        await userRepository.update(currentUser.id!, {email: email.trim()});
        if (status !== email.trim()) {
          // Update store if needed
          // setUser({...user, email: email.trim()});
        }
      }

      const result = await syncAll();

      Alert.alert(
        '✅ Sao lưu thành công',
        `Users: ${result.users.success}\nRooms: ${result.rooms.success}\nMessages: ${result.messages.success}`,
      );
      setStatus('Sao lưu hoàn tất');
    } catch (error) {
      console.error(error);
      Alert.alert('❌ Lỗi', 'Sao lưu thất bại. Vui lòng thử lại.');
      setStatus('Sao lưu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = () => {
    if (!email.trim() || !validateEmail(email)) {
      Alert.alert(
        'Email không hợp lệ',
        'Vui lòng nhập đúng email tài khoản cũ',
      );
      return;
    }

    Alert.alert(
      '⚠️ Cảnh báo',
      'Toàn bộ dữ liệu hiện tại trên máy sẽ bị XÓA và thay thế bằng dữ liệu từ Cloud. Bạn có chắc chắn không?',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Đồng ý Khôi phục',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            setStatus('Đang khôi phục...');
            try {
              const success = await restoreAccount(email.trim());
              if (success) {
                Alert.alert(
                  '✅ Thành công',
                  'Dữ liệu đã được khôi phục. Vui lòng khởi động lại ứng dụng để áp dụng thay đổi.',
                  [{text: 'OK', onPress: () => goBack()}],
                );
                setStatus('Khôi phục thành công');
              } else {
                Alert.alert(
                  '❌ Thất bại',
                  'Không tìm thấy dữ liệu hoặc lỗi kết nối',
                );
                setStatus('Khôi phục thất bại');
              }
            } catch (e) {
              Alert.alert('❌ Lỗi', 'Có lỗi xảy ra');
              setStatus('Lỗi khôi phục');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <Box flex={1} backgroundColor={colors.background} pt={top}>
      {/* Header */}
      <Box px={20} py={15} flexDirection="row" alignItems="center">
        <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kết nối Cloud</Text>
      </Box>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Cloud Info Card */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.card}>
          <Box alignItems="center" mb={20}>
            <Box
              width={80}
              height={80}
              borderRadius={40}
              backgroundColor="#E3F2FD"
              justifyContent="center"
              alignItems="center"
              mb={10}>
              <Ionicons name="cloud-upload" size={40} color="#2196F3" />
            </Box>
            <Text style={styles.cardTitle}>Đồng bộ & Bảo vệ dữ liệu</Text>
            <Text style={styles.cardSubtitle}>
              Sao lưu tin nhắn và danh bạ lên đám mây để không bao giờ mất dữ
              liệu.
            </Text>
          </Box>

          {/* Email Input */}
          <Box w="100%" mb={20}>
            <Text style={styles.label}>Email định danh</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email của bạn..."
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            <Text style={styles.hint}>
              Email này dùng để xác định tài khoản của bạn trên Cloud.
            </Text>
          </Box>
        </Animated.View>

        {/* Actions */}
        <Animated.View
          entering={FadeInUp.delay(200)}
          style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.backupButton,
              isLoading && styles.disabledButton,
            ]}
            onPress={handleBackup}
            disabled={isLoading}>
            {isLoading && status?.includes('Sao lưu') ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="cloud-upload-outline" size={24} color="white" />
            )}
            <Text style={styles.buttonText}>
              {isLoading && status?.includes('Sao lưu')
                ? 'Đang sao lưu...'
                : 'Sao lưu dữ liệu'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.restoreButton,
              isLoading && styles.disabledButton,
            ]}
            onPress={handleRestore}
            disabled={isLoading}>
            {isLoading && status?.includes('khôi phục') ? (
              <ActivityIndicator color="#2196F3" />
            ) : (
              <Ionicons
                name="cloud-download-outline"
                size={24}
                color="#2196F3"
              />
            )}
            <Text style={[styles.buttonText, styles.restoreText]}>
              {isLoading && status?.includes('khôi phục')
                ? 'Đang khôi phục...'
                : 'Khôi phục dữ liệu'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {status && !isLoading && (
          <Animated.View entering={FadeInDown} style={styles.statusContainer}>
            <Text style={styles.statusText}>{status}</Text>
          </Animated.View>
        )}
      </ScrollView>
    </Box>
  );
};

export default SyncScreen;

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    marginLeft: 4,
  },
  actionContainer: {
    gap: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 10,
  },
  backupButton: {
    backgroundColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  restoreButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  restoreText: {
    color: '#2196F3',
  },
  disabledButton: {
    opacity: 0.7,
  },
  statusContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
