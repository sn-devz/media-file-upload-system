import { useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import { useUploaderStore } from '@/store';
import { MAX_FILE_SIZE } from '@/constants';
import { calculateOverallProgress } from '@/utils';
import { NewUploadFile } from '@/types';

const BACKGROUND_UPLOAD_TASK = 'BACKGROUND_UPLOAD_TASK';

export const useMediaController = () => {
  const { files, addFiles, pauseUpload, resumeUpload, cancelUpload, removeFile } = useUploaderStore();

  useEffect(() => {
    (async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
      }
    })();
  }, []);

  useEffect(() => {
    // Register Background Fetch
    (async () => {
      try {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_UPLOAD_TASK, {
          minimumInterval: 60 * 15, // 15 minutes
          stopOnTerminate: false, // android only
          startOnBoot: true, // android only
        });
      } catch (err) {
        console.warn("Background fetch failed to register:", err);
      }
    })();
  }, []);

  const pickDocument = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'You need to allow access to your photo gallery.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const validFiles: NewUploadFile[] = [];

        for (const asset of result.assets) {
          const fileSize = asset.fileSize ?? 1024 * 1024; // fallback size
          if (fileSize > MAX_FILE_SIZE) {
            Alert.alert('File Too Large', `The file "${asset.fileName}" exceeds the 50MB limit.`);
            return;
          }

          validFiles.push({
            uri: asset.uri,
            name: asset.fileName ?? `gallery_${Date.now()}.jpg`,
            size: fileSize,
            mimeType: asset.mimeType ?? 'image/jpeg',
          });
        }
        
        if (validFiles.length > 0) {
          addFiles(validFiles);
        }
      }
    } catch (err) {
      console.warn("Gallery picker error:", err);
    }
  }, [addFiles]);

  const takePhoto = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'You refuse to allow this app to access your camera!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
          Alert.alert('File Too Large', `The captured media exceeds the 50MB limit.`);
          return;
        }

        addFiles([{
          uri: asset.uri,
          name: asset.fileName ?? `capture_${Date.now()}.jpg`,
          size: asset.fileSize ?? 1024 * 1024,
          mimeType: asset.mimeType ?? 'image/jpeg',
        }]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.toLowerCase().includes('simulator') || errorMessage.toLowerCase().includes('not available')) {
        Alert.alert('Camera Unavailable', 'The camera is not available on the iOS Simulator. Please use the "Gallery" button instead.');
      } else {
        Alert.alert('Camera Error', 'Failed to open camera: ' + errorMessage);
      }
    }
  }, [addFiles]);



  const totalProgress = useMemo(() => {
    return calculateOverallProgress(files);
  }, [files]);

  return {
    files,
    totalProgress,
    pickDocument,
    takePhoto,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    removeFile,
  };
};
