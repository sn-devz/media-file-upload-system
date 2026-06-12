import { ScaledSheet } from 'react-native-size-matters';
import { colors } from './colors';

export const fileItemStyles = ScaledSheet.create({
  fileItem: {
    backgroundColor: colors.white,
    padding: '16@s',
    borderRadius: '12@ms',
    marginBottom: '12@vs',
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9', // slate100
  },
  fileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '8@vs',
  },
  thumbnail: {
    width: '44@s',
    height: '44@s',
    borderRadius: '10@ms',
    marginRight: '12@s',
    backgroundColor: colors.slate100,
  },
  fileIconPlaceholder: {
    width: '44@s',
    height: '44@s',
    borderRadius: '10@ms',
    marginRight: '12@s',
    backgroundColor: colors.slate100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIconText: {
    fontSize: '10@ms',
    color: colors.slate400,
    fontWeight: 'bold',
  },
  details: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6@vs',
  },
  fileName: {
    fontSize: '15@ms',
    fontWeight: '600',
    flex: 1,
    marginRight: '8@s',
    color: colors.slate900,
  },
  statusBadge: {
    fontSize: '11@ms',
    backgroundColor: colors.slate100,
    paddingHorizontal: '6@s',
    paddingVertical: '3@vs',
    borderRadius: '6@ms',
    overflow: 'hidden',
    textTransform: 'capitalize',
    color: colors.slate600,
    fontWeight: '500',
  },
  statusCompleted: {
    backgroundColor: colors.green500,
    color: colors.white,
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    height: '6@vs',
    backgroundColor: colors.slate100,
    borderRadius: '3@ms',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
    paddingTop: '8@vs',
    marginTop: '4@vs',
    gap: 8,
  },
  errorText: {
    color: colors.red500,
    fontSize: '12@ms',
    marginTop: '4@vs',
  }
});
