
import { useTheme } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import React, { useRef } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Box } from './Layout/Box';
import { LOGO_START } from '../../assets/animation';
const { width } = Dimensions.get('window');
const StartLogo = () => {
  const { colors } = useTheme();
  const animation = useRef<LottieView>(null);
  return (
    <Box backgroundColor={colors.background} alignItems='center' justifyContent='center' flex={1}>
       <LottieView
        ref={animation}
        source={LOGO_START}
        autoPlay
        loop
        style={{width:width*0.9,height:width*0.9}}
      />
    </Box>
  )
}

export default StartLogo

const styles = StyleSheet.create({
  lottie: {
    width: 400,
    height: 400,
  },
});