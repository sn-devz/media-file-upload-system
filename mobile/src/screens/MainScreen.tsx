import React, { useCallback } from 'react';
import { Text, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMediaController } from '@/hooks';
import { appStyles as styles } from '@/styles';
import { FileListItem, Button, OverallProgress } from '@/components';
import { Image, Camera } from 'lucide-react-native';

export default function MainScreen() {
  const {
    files,
    totalProgress,
    pickDocument,
    takePhoto,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    removeFile,
  } = useMediaController();

  const renderItem = useCallback(({ item }: { item: any }) => (
    <FileListItem 
      item={item} 
      onPause={pauseUpload} 
      onResume={resumeUpload} 
      onCancel={cancelUpload} 
      onRemove={removeFile} 
    />
  ), [pauseUpload, resumeUpload, cancelUpload, removeFile]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Media Upload System</Text>
      
      {files.length > 0 && <OverallProgress progress={totalProgress} />}
      
      <View style={styles.buttonRow}>
        <Button 
          title="Gallery"
          icon={<Image color="#FFF" size={20} />}
          variant="primary"
          onPress={pickDocument}
          style={styles.actionButtonSpacing}
        />
        <Button 
          title="Photo"
          icon={<Camera color="#FFF" size={20} />}
          variant="success"
          onPress={takePhoto}
          style={styles.actionButton}
        />
      </View>

      <FlatList
        data={files}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No files queued for upload.</Text>}
      />
    </SafeAreaView>
  );
}
