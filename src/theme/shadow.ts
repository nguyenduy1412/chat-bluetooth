import { colors } from './colors';

export const shadow = {
  dropShadow: {
    shadowOffset: {
      width: 1,
      height: 0,
    },
    shadowRadius: 8,
    shadowColor: colors.grayScale[80],
    shadowOpacity: 0.1,
    elevation: 3,
  },
} as const;
