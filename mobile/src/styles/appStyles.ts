import { ScaledSheet } from 'react-native-size-matters';
import { colors } from './colors';

export const appStyles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate50,
  },
  title: {
    fontSize: '24@ms',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: '20@vs',
    color: colors.slate900,
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: '20@s',
    marginBottom: '20@vs',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonSpacing: {
    flex: 1,
    marginRight: 4,
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: '16@ms',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: '20@s',
    paddingBottom: '40@vs',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.slate400,
    marginTop: '40@vs',
    fontSize: '14@ms',
  },
});
