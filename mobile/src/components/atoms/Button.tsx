import React, { memo, useMemo } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { 
  buttonStyles as styles, 
  containerVariantMap, 
  containerSizeMap, 
  textVariantMap, 
  textSizeMap 
} from '@/styles';
import { ButtonProps } from '@/types';

const Button = ({ 
  title, 
  icon,
  variant = 'primary', 
  size = 'medium', 
  style, 
  textStyle, 
  ...rest 
}: ButtonProps) => {
  
  const containerStyles = useMemo(() => [
    styles.baseContainer,
    containerVariantMap[variant],
    containerSizeMap[size],
    style,
  ], [variant, size, style]);

  const textStyles = useMemo(() => [
    styles.baseText,
    textVariantMap[variant],
    textSizeMap[size],
    textStyle,
  ], [variant, size, textStyle]);

  return (
    <TouchableOpacity style={[containerStyles, icon ? { flexDirection: 'column' } : null]} {...rest}>
      {icon}
      <Text style={[textStyles, icon ? { marginTop: 4, fontSize: 13 } : null]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default memo(Button);
