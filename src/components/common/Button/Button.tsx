import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { ButtonVariant } from './types';

import Spinner from './Spinner';
import { Box } from '../Layout/Box';
import { colors } from '../../../theme/colors';

type ButtonProps = {
  text?: string;
  onPress?: () => void;
  title?: string;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: ButtonVariant;
  style?: object;
  textStyle?: object;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  icon?: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({ onPress, title, disabled, isLoading, variant, text, style, textStyle, rightIcon, leftIcon, icon }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || isLoading} style={[styles.button, style]}>
      {leftIcon && <Box>{leftIcon}</Box>}
      {isLoading ? <Spinner color={colors.white} /> : (icon ? icon : <Text style={[styles.text, textStyle]}>{title}</Text>)}
      {rightIcon && <Box>{rightIcon}</Box>}
    </TouchableOpacity>
  )
}

export default Button;

const styles = StyleSheet.create({
    button:{
        padding: 10,
        height:50,
        backgroundColor: colors.limeGreen,
        justifyContent:'center',
        alignItems:'center',
        borderRadius:15,
        width:'100%'
    },
    text:{
        color: colors.white,
        fontSize:16,
        fontWeight:'bold'
    }
})