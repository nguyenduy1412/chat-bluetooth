import {useTheme} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import React, {useRef} from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {Box} from './Layout/Box';
import {LOGO_START} from '../../assets/animation';
const {width} = Dimensions.get('window');
type Props = {
  size?: number;
};
const StartLogo = ({size = width * 0.9}: Props) => {
  const {colors} = useTheme();
  const animation = useRef<LottieView>(null);
  return (
    <Box alignItems="center" justifyContent="center">
      <LottieView
        ref={animation}
        source={LOGO_START}
        autoPlay
        loop
        style={{width: size, height: size}}
      />
    </Box>
  );
};

export default StartLogo;

const styles = StyleSheet.create({
  lottie: {
    width: 400,
    height: 400,
  },
});
