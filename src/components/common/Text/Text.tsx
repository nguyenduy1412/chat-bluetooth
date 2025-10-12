import React, { useMemo } from 'react';
import type { ColorValue, TextProps as RNTextProps } from 'react-native';
import { Text as RNText } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { fonts } from '../../../theme/fonts';


export type FontWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';

export interface TextProps extends RNTextProps {
  fontSize?: number;
  fontWeight?: FontWeight;
  italic?: boolean;
  underline?: boolean;
  align?: 'auto' | 'left' | 'right' | 'center' | undefined;
  color?: ColorValue;
}

export const getFontFamily = (
  fontWeight: FontWeight = 'normal',
  italic = false
): string => {
  switch (fontWeight) {
    case 'light':
      return italic ? fonts.Poppins.LightItalic : fonts.Poppins.Light;
    case 'normal':
      return italic ? fonts.Poppins.Italic : fonts.Poppins.Regular;
    case 'medium':
      return italic ? fonts.Poppins.MediumItalic : fonts.Poppins.Medium;
    case 'semibold':
      return italic ? fonts.Poppins.SemiBoldItalic : fonts.Poppins.SemiBold;
    case 'bold':
      return italic ? fonts.Poppins.BoldItalic : fonts.Poppins.Bold;
    default:
      return italic ? fonts.Poppins.Italic : fonts.Poppins.Regular;
  }
};

export const Text: React.FC<TextProps> = ({
  children,
  fontSize,
  fontWeight,
  italic,
  underline,
  align = 'auto',
  color,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const fontFamily = useMemo(
    () => getFontFamily(fontWeight, italic),
    [fontWeight, italic]
  );

  return (
    <RNText
      style={[
        { fontFamily },
        { color: color ?? colors.text },
        { textAlign: align ?? align },
        { textDecorationLine: underline ? 'underline' : 'none' },
        fontSize
          ? {
              fontSize,
            }
          : undefined,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};
