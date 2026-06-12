import React, { memo } from 'react';
import { View } from 'react-native';
import { progressStyles as styles } from '@/styles';

import { ProgressBarProps } from '@/types';

const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    <View style={styles.barBackground}>
      <View 
        testID="progress-fill"
        style={[styles.barFill, { width: `${progress}%` as any }]} 
      />
    </View>
  );
};

export default memo(ProgressBar);
