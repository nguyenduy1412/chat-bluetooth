import {Box} from '@/components/common/Layout/Box';
import React, {memo, useEffect} from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

type Props = {
  size: number;
  color: string;
  duration: number;
};
const AnimationThingking = ({size = 7, color = '#90949c', duration = 1000}: Props) => {
  const translateY1 = useSharedValue(0);
  const translateY2 = useSharedValue(0);
  const translateY3 = useSharedValue(0);
  
  const opacity1 = useSharedValue(0.4);
  const opacity2 = useSharedValue(0.4);
  const opacity3 = useSharedValue(0.4);

  useEffect(() => {
    const upDuration = duration * 0.35;
    const downDuration = duration * 0.35;
    const pauseDuration = duration * 0.3;

    const createWaveAnimation = (delay: number) => {
      return withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-6, {
              duration: upDuration,
              easing: Easing.bezier(0.33, 0.01, 0.67, 1),
            }),
            withTiming(-6, {
              duration: pauseDuration,
              easing: Easing.linear,
            }),
            withTiming(0, {
              duration: downDuration,
              easing: Easing.bezier(0.33, 0, 0.67, 0.99),
            }),
          ),
          -1,
          false,
        ),
      );
    };

    const createOpacityAnimation = (delay: number) => {
      return withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, {
              duration: upDuration,
              easing: Easing.bezier(0.33, 0.01, 0.67, 1),
            }),
            withTiming(1, {
              duration: pauseDuration,
              easing: Easing.linear,
            }),
            withTiming(0.4, {
              duration: downDuration,
              easing: Easing.bezier(0.33, 0, 0.67, 0.99),
            }),
          ),
          -1,
          false,
        ),
      );
    };

    translateY1.value = createWaveAnimation(0);
    translateY2.value = createWaveAnimation(duration * 0.2);
    translateY3.value = createWaveAnimation(duration * 0.4);
    
    opacity1.value = createOpacityAnimation(0);
    opacity2.value = createOpacityAnimation(duration * 0.2);
    opacity3.value = createOpacityAnimation(duration * 0.4);
  }, [duration]);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{translateY: translateY1.value}],
    opacity: opacity1.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{translateY: translateY2.value}],
    opacity: opacity2.value,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{translateY: translateY3.value}],
    opacity: opacity3.value,
  }));

  return (
    <Box px={16} py={12} flexDirection='row' alignItems='center' gap={4} alignSelf='flex-start'>
      <Animated.View
        style={[{backgroundColor: color, width:size,height:size,borderRadius:size / 2}, dot1Style]}
      />
      <Animated.View
        style={[{backgroundColor: color, width:size,height:size,borderRadius:size / 2}, dot2Style]}
      />
      <Animated.View
        style={[{backgroundColor: color, width:size,height:size,borderRadius:size / 2}, dot3Style]}
      />
    </Box>
  );
};

export default memo(AnimationThingking);
