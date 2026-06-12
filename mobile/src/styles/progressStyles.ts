import { ScaledSheet } from 'react-native-size-matters';
import { colors } from './colors';

export const progressStyles = ScaledSheet.create({
  container: {
    paddingHorizontal: '20@s',
    marginBottom: '15@vs',
  },
  label: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: colors.slate600,
    marginBottom: '6@vs',
  },
  barBackground: {
    height: '8@vs',
    backgroundColor: colors.slate200,
    borderRadius: '4@ms',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.blue500,
  },
});
