import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MainScreen from '@/screens/MainScreen';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { processUploadQueue } from '@/services/uploadManager';
import { useUploaderStore } from '@/store';

import * as Notifications from 'expo-notifications';

const BACKGROUND_UPLOAD_TASK = 'BACKGROUND_UPLOAD_TASK';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

TaskManager.defineTask(BACKGROUND_UPLOAD_TASK, async () => {
  try {
    const { files } = useUploaderStore.getState();
    const pendingUploads = files.filter(f => f.status === 'uploading' || f.status === 'pending');
    
    if (pendingUploads.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    await processUploadQueue();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export default function App() {
  return (
    <SafeAreaProvider>
      <MainScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
