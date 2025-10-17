import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../../theme/colors';

type BlueShimmerBarProps = {
  w?: number;
};

const BlueShimmerBar = ({ w }: BlueShimmerBarProps) => {
  const width = w || 200;
  
  const wave1 = useSharedValue(-width);
  const wave2 = useSharedValue(-width);
  const wave3 = useSharedValue(-width);

  useEffect(() => {
    wave1.value = withRepeat(
      withTiming(width * 2, {
        duration: 3500,
        easing: Easing.bezier(0.45, 0, 0.55, 1),
      }),
      -1,
      false
    );

    setTimeout(() => {
      wave2.value = withRepeat(
        withTiming(width * 2, {
          duration: 3500,
          easing: Easing.bezier(0.45, 0, 0.55, 1),
        }),
        -1,
        false
      );
    }, 500);

    setTimeout(() => {
      wave3.value = withRepeat(
        withTiming(width * 2, {
          duration: 3500,
          easing: Easing.bezier(0.45, 0, 0.55, 1),
        }),
        -1,
        false
      );
    }, 1000);
  }, [width]);
  console.log("Rendering BlueShimmerBar with width:", width);
  const waveStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateX: wave1.value }],
  }));

  const waveStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateX: wave2.value }],
  }));

  const waveStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateX: wave3.value }],
  }));

  return (
    <View style={[styles.container, { width }]}>
      <LinearGradient
        colors={[colors.skyBlueLight, colors.skyBlue, colors.skyBlueLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      
      <Animated.View style={[StyleSheet.absoluteFill, waveStyle1]}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(0,150,255,0.3)',
            'rgba(0,200,255,0.8)',
            'rgba(0,220,255,1)',
            'rgba(0,200,255,0.8)',
            'rgba(0,150,255,0.3)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.wave}
        />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, waveStyle2]}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(100,180,255,0.4)',
            'rgba(50,170,255,0.7)',
            'rgba(100,180,255,0.4)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.wave}
        />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, waveStyle3]}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(150,200,255,0.3)',
            'rgba(150,200,255,0.5)',
            'rgba(150,200,255,0.3)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.wave}
        />
      </Animated.View>

      <View style={styles.highlight} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 2,
    backgroundColor: colors.skyBlueLight,
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: '#00DCFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  wave: {
    width: '100%',
    height: '100%',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});

export default BlueShimmerBar;
