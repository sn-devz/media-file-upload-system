import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fileItemStyles as styles } from '@/styles';
import { colors } from '@/styles';
import { FileListItemProps } from '@/types';
import Button from '../atoms/Button';

const FileListItem = ({ item, onPause, onResume, onCancel, onRemove }: FileListItemProps) => {
  // Memoize event handlers to prevent recreating them on every render
  const handlePause = useCallback(() => onPause(item.id), [onPause, item.id]);
  const handleResume = useCallback(() => onResume(item.id), [onResume, item.id]);
  const handleCancel = useCallback(() => onCancel(item.id), [onCancel, item.id]);
  const handleRemove = useCallback(() => onRemove(item.id), [onRemove, item.id]);

  // Memoize dynamic styles
  const progressStyle = useMemo(() => {
    let bgColor = colors.blue500;
    if (item.status === 'error') bgColor = colors.red500;
    else if (item.status === 'completed') bgColor = colors.green500;

    return [
      styles.progressBar,
      { width: `${item.progress}%` as any, backgroundColor: bgColor }
    ];
  }, [item.progress, item.status]);

  return (
    <View style={styles.fileItem}>
      <View style={styles.fileContent}>
        {item.mimeType.startsWith('image/') || item.mimeType.startsWith('video/') ? (
          <Image 
            source={{ uri: item.uri }} 
            style={styles.thumbnail} 
          />
        ) : (
          <View style={styles.fileIconPlaceholder}>
            <Text style={styles.fileIconText}>FILE</Text>
          </View>
        )}
        
        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.statusBadge, item.status === 'completed' && styles.statusCompleted]}>
                {item.status}
              </Text>
              {(item.status === 'completed' || item.status === 'error') && (
                <TouchableOpacity onPress={handleRemove} style={{ padding: 4 }}>
                  <Ionicons name="trash-outline" size={18} color={colors.red500} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.progressWrapper}>
            <View style={styles.progressContainer}>
              <View style={progressStyle} />
            </View>
          </View>

          {item.status === 'error' && (
            <Text style={styles.errorText}>{item.errorMessage}</Text>
          )}
        </View>
      </View>

      {(item.status === 'uploading' || item.status === 'paused' || item.status === 'pending') && (
        <View style={styles.actions}>
          {item.status === 'uploading' && (
            <Button title="Pause" onPress={handlePause} variant="secondary" size="small" />
          )}
          {item.status === 'paused' && (
            <Button title="Resume" onPress={handleResume} variant="secondary" size="small" />
          )}
          <Button title="Cancel" onPress={handleCancel} variant="danger" size="small" />
        </View>
      )}
    </View>
  );
};

export default memo(FileListItem);
