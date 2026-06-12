import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { progressStyles as styles } from '@/styles';
import ProgressBar from '../atoms/ProgressBar';

import { OverallProgressProps } from '@/types';

const OverallProgress = ({ progress }: OverallProgressProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Overall Progress ({Math.round(progress)}%)
      </Text>
      <ProgressBar progress={progress} />
    </View>
  );
};

export default memo(OverallProgress);
