import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import button from '@/theme/button';
import { colors } from '@/theme/colors';

export const lightColors = {
  primary: colors.skyBlue,
  primaryVariant: colors.skyBlueLight,
  primaryVariant2: colors.skyBlueDark,
  primaryVariant3: colors.orange[5],
  secondary: colors.darkGreen[100],
  secondaryVariant: colors.darkGreen[50],

  // background
  background: colors.white,
  secondaryBackground: colors.grey[10],
  surface: colors.grey[50],
  error: colors.red,
  divider: colors.grayScale[10],
  tertiary: colors.grey[20],
  tertiaryHighlight: colors.grey[100],

  // text
  text: colors.grayScale[100],
  textSuperSecondary: colors.grayScale[70],
  textSecondary: colors.grayScale[50],
  textTertiary: colors.grayScale[30],
  textDisabled: colors.grayScale[10],
  textBackground: colors.grayScale[4],
  onPrimary: colors.white,
  onSecondary: colors.white,
  onSurface: colors.darkGreen[100],
  onBackground: colors.darkGreen[100],
  onError: colors.white,
  placeholder: colors.greyDarker,
  borderLight: colors.grayScale[20],

  // UI Components
  searchBackground: colors.grayScale[10], // Cho search input background
  cardBackground: colors.white,
  buttonSecondary: colors.grayScale[20],
  
  bottomTab: colors.grayScale[40],
  activeBottomTab: colors.skyBlue,
  online: colors.lightGreen[50],

  // insert the colors as pelette
  palette: colors,
};

export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...lightColors,
  },
  components: {
    button: button(lightColors),
  },
};

export const darkColors: ColorType = {
  primary: colors.skyBlue,
  primaryVariant: colors.skyBlueLight,
  primaryVariant2: colors.skyBlueDark,
  primaryVariant3: colors.orange[5],
  secondary: colors.darkGreen[100],
  secondaryVariant: colors.darkGreen[50],

  // background
  background: colors.white,
  secondaryBackground: colors.grey[10],
  surface: colors.grey[50],
  error: colors.red,
  divider: colors.grayScale[10],
  tertiary: colors.grey[20],
  tertiaryHighlight: colors.grey[100],

  // text
  text: colors.grayScale[100],
  textSuperSecondary: colors.grayScale[70],
  textSecondary: colors.grayScale[50],
  textTertiary: colors.grayScale[30],
  textDisabled: colors.grayScale[10],
  textBackground: colors.grayScale[4],
  onPrimary: colors.white,
  onSecondary: colors.white,
  onSurface: colors.darkGreen[100],
  onBackground: colors.white,
  onError: colors.white,
  placeholder: colors.greyDarker,
  borderLight: colors.grayScale[20],

  // UI Components  
  searchBackground: colors.grayScale[20], // Dark theme search background
  cardBackground: colors.grayScale[10],
  buttonSecondary: colors.grayScale[30],

  bottomTab: colors.grayScale[40],
  activeBottomTab: colors.skyBlue,
  online: colors.lightGreen[50],

  // insert the colors as pelette
  palette: colors,
};

export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    ...darkColors,
  },
  components: {
    button: button(darkColors),
  },
};

export type ColorType = typeof lightColors;
export type ComponentThemeType = typeof lightTheme.components;
