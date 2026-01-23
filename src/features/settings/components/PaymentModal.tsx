import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import {Ionicons} from '@expo/vector-icons';
import {colors} from '@/theme/colors';
import {LinearGradient} from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import StartLogo from '@/components/common/StartLogo';
import {
  confirmPlatformPayPayment,
  PlatformPay,
} from '@stripe/stripe-react-native';
import {SUPABASE_FUNCTIONS, SUPABASE_ANON_KEY} from '@/constant';

const {width} = Dimensions.get('window');

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: any) => void;
}

type PlanType = 'monthly' | 'yearly';

const PLAN_PRICES = {
  monthly: 99000,
  yearly: 100000,
};

const features = [
  {
    icon: '🚀',
    text: 'Truy cập không giới hạn',
    subtext: 'Mọi tính năng premium',
  },
  {icon: '🔒', text: 'Bảo mật tuyệt đối', subtext: 'Mã hóa end-to-end'},
  {
    icon: '⚡',
    text: 'Đồng bộ dữ liệu',
    subtext: 'Realtime trên mọi thiết bị',
  },
];

const FeatureItem = ({
  icon,
  text,
  subtext,
  index,
  visible,
}: {
  icon: string;
  text: string;
  subtext: string;
  index: number;
  visible: boolean;
}) => {
  const progress = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progress.value = withDelay(
        index * 150,
        withSpring(1, {damping: 12, stiffness: 100}),
      );
      shimmer.value = withDelay(
        index * 150 + 500,
        withRepeat(
          withTiming(1, {duration: 2000, easing: Easing.linear}),
          -1,
          false,
        ),
      );
    } else {
      progress.value = 0;
      shimmer.value = 0;
    }
  }, [visible, index, progress, shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {translateX: interpolate(progress.value, [0, 1], [-30, 0])},
      {scale: interpolate(progress.value, [0, 1], [0.8, 1])},
    ],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]),
  }));

  return (
    <Animated.View style={[styles.featureItem, animatedStyle]}>
      <LinearGradient
        colors={['#E3F2FD', '#BBDEFB', '#E3F2FD']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.featureGradient}>
        <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />
        <View style={styles.featureIconContainer}>
          <Text style={styles.featureIcon}>{icon}</Text>
        </View>
        <View style={styles.featureTextContainer}>
          <Text style={styles.featureTitle}>{text}</Text>
          <Text style={styles.featureSubtext}>{subtext}</Text>
        </View>
        <Ionicons name="checkmark-circle" size={22} color="#1E90FF" />
      </LinearGradient>
    </Animated.View>
  );
};

export default function PaymentModal({
  visible,
  onClose,
  onPaymentSuccess,
  onPaymentError,
}: PaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [isLoading, setIsLoading] = useState(false);

  const fetchPaymentIntentClientSecret = async (amount: number) => {
    const response = await fetch(SUPABASE_FUNCTIONS.CREATE_PAYMENT_INTENT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        amount,
        currency: 'vnd',
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data.clientSecret;
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const amount = PLAN_PRICES[selectedPlan];
      const clientSecret = await fetchPaymentIntentClientSecret(amount);

      if (!clientSecret) {
        Alert.alert('Lỗi', 'Không thể tạo thanh toán');
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
        onPaymentError?.(error);
        return;
      }

      Alert.alert('Thành công', 'Thanh toán đã được xác nhận thành công!');
      console.log('Payment success:', JSON.stringify(paymentIntent, null, 2));
      onPaymentSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Payment failed:', err);
      Alert.alert('Lỗi', err.message || 'Thanh toán thất bại');
      onPaymentError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      backdropOpacity={0.6}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      animationInTiming={500}
      animationOutTiming={400}
      backdropTransitionInTiming={500}
      backdropTransitionOutTiming={400}>
      <View style={styles.container}>
        {/* Swipe Indicator */}
        <View style={styles.swipeIndicator} />
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <StartLogo size={200} />
        </View>

        {/* Title */}
        <LinearGradient
          colors={['#1E90FF', '#00BFFF']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.titleGradient}>
          <Text style={styles.title}>✨ Unlock Premium ✨</Text>
        </LinearGradient>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <FeatureItem
              key={index}
              icon={feature.icon}
              text={feature.text}
              subtext={feature.subtext}
              index={index}
              visible={visible}
            />
          ))}
        </View>

        {/* Plan Selection */}
        <View style={styles.plansContainer}>
          {/* Yearly Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'yearly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.7}>
            {selectedPlan === 'yearly' && (
              <LinearGradient
                colors={['rgba(30, 144, 255, 0.1)', 'rgba(0, 191, 255, 0.1)']}
                style={StyleSheet.absoluteFill}
              />
            )}
            <View
              style={[
                styles.radioOuter,
                selectedPlan === 'yearly' && styles.radioOuterSelected,
              ]}>
              {selectedPlan === 'yearly' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.planInfo}>
              <View style={styles.planTitleRow}>
                <Text style={styles.planTitle}>Hàng năm</Text>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.discountBadge}>
                  <Text style={styles.discountText}>🔥 -35%</Text>
                </LinearGradient>
              </View>
              <Text style={styles.planPrice}>100.000đ/năm</Text>
            </View>
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={styles.subscribeButtonContainer}
          onPress={handleSubscribe}
          disabled={isLoading}
          activeOpacity={0.9}>
          <LinearGradient
            colors={['#1E90FF', '#00BFFF', '#1E90FF']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.subscribeButton}>
            <Text style={styles.subscribeButtonText}>
              {isLoading ? 'Đang xử lý...' : '🎉 Start subscription'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerText}>
          Tự động gia hạn • Hủy bất cứ lúc nào
        </Text>

        <View style={styles.secureRow}>
          <Ionicons name="shield-checkmark" size={14} color="#1E90FF" />
          <Text style={styles.secureText}>Thanh toán an toàn & bảo mật</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeIndicator: {
    width: 40,
    height: 5,
    backgroundColor: colors.grayScale[30],
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageBorder: {
    width: 130,
    height: 130,
    borderRadius: 65,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: 118,
    height: 118,
    borderRadius: 59,
  },
  titleGradient: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 20,
    gap: 10,
  },
  featureItem: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  featureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#1E90FF',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E90FF',
    marginBottom: 2,
  },
  featureSubtext: {
    fontSize: 12,
    color: colors.grayScale[60],
  },
  plansContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.grayScale[20],
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  planCardSelected: {
    borderColor: '#1E90FF',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.grayScale[30],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  radioOuterSelected: {
    borderColor: '#1E90FF',
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1E90FF',
  },
  planInfo: {
    flex: 1,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.black,
  },
  planPrice: {
    fontSize: 14,
    color: colors.grayScale[50],
    marginTop: 3,
  },
  discountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#1E90FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  bestValueText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  subscribeButtonContainer: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#1E90FF',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  subscribeButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  footerText: {
    fontSize: 12,
    color: colors.grayScale[40],
    textAlign: 'center',
    marginBottom: 8,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secureText: {
    fontSize: 12,
    color: '#1E90FF',
    fontWeight: '500',
  },
});
