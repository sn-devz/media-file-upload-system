import { ScaledSheet } from 'react-native-size-matters';
import { colors } from './colors';

export const buttonStyles = ScaledSheet.create({
  // Base
  baseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12@ms',
    flexDirection: 'row',
  },
  baseText: {
    fontWeight: '600',
  },

  // Sizes
  sizeSmall: {
    paddingVertical: '6@vs',
    paddingHorizontal: '12@s',
  },
  textSmall: {
    fontSize: '14@ms',
  },
  
  sizeMedium: {
    paddingVertical: '10@vs',
    paddingHorizontal: '12@s',
  },
  textMedium: {
    fontSize: '16@ms',
  },

  sizeLarge: {
    paddingVertical: '16@vs',
    paddingHorizontal: '24@s',
  },
  textLarge: {
    fontSize: '18@ms',
  },

  // Variants (Container)
  variantPrimary: {
    backgroundColor: colors.blue500,
  },
  variantSuccess: {
    backgroundColor: colors.green500,
  },
  variantSecondary: {
    backgroundColor: colors.slate100,
  },
  variantDanger: {
    backgroundColor: colors.red50,
  },
  variantGhost: {
    backgroundColor: 'transparent',
  },

  // Variants (Text)
  textPrimary: {
    color: colors.white,
  },
  textSuccess: {
    color: colors.white,
  },
  textSecondary: {
    color: colors.slate700,
  },
  textDanger: {
    color: colors.red500,
  },
  textGhost: {
    color: colors.blue500,
  },
});

export const containerVariantMap = {
  primary: buttonStyles.variantPrimary,
  secondary: buttonStyles.variantSecondary,
  success: buttonStyles.variantSuccess,
  danger: buttonStyles.variantDanger,
  ghost: buttonStyles.variantGhost,
};

export const containerSizeMap = {
  small: buttonStyles.sizeSmall,
  medium: buttonStyles.sizeMedium,
  large: buttonStyles.sizeLarge,
};

export const textVariantMap = {
  primary: buttonStyles.textPrimary,
  secondary: buttonStyles.textSecondary,
  success: buttonStyles.textSuccess,
  danger: buttonStyles.textDanger,
  ghost: buttonStyles.textGhost,
};

export const textSizeMap = {
  small: buttonStyles.textSmall,
  medium: buttonStyles.textMedium,
  large: buttonStyles.textLarge,
};
