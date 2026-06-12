import React from 'react';
import { TouchableOpacityProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { MobileUploadFile } from './uploader';

export interface FileListItemProps {
  item: MobileUploadFile;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
}

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export interface ProgressBarProps {
  progress: number;
}

export interface OverallProgressProps {
  progress: number;
}
