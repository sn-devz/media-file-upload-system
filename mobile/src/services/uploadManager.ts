import * as Notifications from 'expo-notifications';
import { useUploaderStore } from '@/store';
import { MobileUploadFile } from '@/types';
import { apiService } from './apiService';
import { fileService } from './fileService';
import {
  calculatePercentage,
  calculateChunkLength,
  calculateTotalChunks,
  countFilesByStatus,
  getFilesByStatus,
  getFilesToStart
} from '@/utils';

import { CHUNK_SIZE, MAX_CONCURRENT_UPLOADS, MAX_RETRIES } from '@/constants';

const processingSet = new Set<string>();

const uploadChunkWithRetry = async (uploadId: string, chunkIndex: number, tempUri: string) => {
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      await apiService.uploadChunk(uploadId, chunkIndex, tempUri);
      return;
    } catch (e) {
      attempt++;
      if (attempt >= MAX_RETRIES) throw new Error('Network error during chunk upload');
      await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt)));
    }
  }
};

const processFileChunks = async (uploadFile: MobileUploadFile, uploadId: string, totalChunks: number) => {
  let uploadedChunks = [...uploadFile.uploadedChunks];
  const { updateFile } = useUploaderStore.getState();

  for (let i = 0; i < totalChunks; i++) {
    // Check if user paused or cancelled
    const currentFileState = useUploaderStore.getState().files.find(f => f.id === uploadFile.id);
    if (!currentFileState || currentFileState.status !== 'uploading') {
      processingSet.delete(uploadFile.id);
      return false; // Stopped
    }

    if (uploadedChunks.includes(i)) continue;

    const start = i * CHUNK_SIZE;
    const chunkLength = calculateChunkLength(uploadFile.size, start, CHUNK_SIZE);
    const tempChunkUri = fileService.getTempChunkUri(uploadId, i);

    await fileService.createTempChunk(uploadFile.uri, start, chunkLength, tempChunkUri);
    await uploadChunkWithRetry(uploadId, i, tempChunkUri);
    await fileService.cleanupTempChunk(tempChunkUri);

    uploadedChunks.push(i);
    const progress = calculatePercentage(uploadedChunks.length, totalChunks);
    updateFile(uploadFile.id, { uploadedChunks, progress });
  }

  return true; // Completed all chunks
};

export const startUpload = async (fileId: string) => {
  if (processingSet.has(fileId)) return;

  const { files, updateFile } = useUploaderStore.getState();
  const uploadFile = files.find(f => f.id === fileId);
  if (!uploadFile) return;

  processingSet.add(uploadFile.id);
  updateFile(uploadFile.id, { status: 'uploading' });

  try {
    const totalChunks = calculateTotalChunks(uploadFile.size, CHUNK_SIZE);
    let uploadId = uploadFile.uploadId;

    if (!uploadId) {
      uploadId = await apiService.initiateUpload(uploadFile.name, totalChunks, uploadFile.size);
      updateFile(uploadFile.id, { uploadId });
    }

    const completed = await processFileChunks(uploadFile, uploadId, totalChunks);

    if (completed) {
      await apiService.finalizeUpload(uploadId);
      updateFile(uploadFile.id, { status: 'completed', progress: 100 });

      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Upload Complete 🎉',
          body: `"${uploadFile.name}" has successfully finished uploading.`,
        },
        trigger: null,
      });
    }

  } catch (error: any) {
    updateFile(uploadFile.id, { status: 'error', errorMessage: error.message || 'Upload failed' });
  } finally {
    processingSet.delete(uploadFile.id);
  }
};

export const processUploadQueue = () => {
  const { files } = useUploaderStore.getState();
  const uploadingCount = countFilesByStatus(files, 'uploading');
  const pendingFiles = getFilesByStatus(files, 'pending');

  const filesToStart = getFilesToStart(pendingFiles, uploadingCount, MAX_CONCURRENT_UPLOADS);
  filesToStart.forEach(file => {
    startUpload(file.id);
  });
};

// Headless listener: Watch the Zustand store for any new pending files or available slots
useUploaderStore.subscribe((state, prevState) => {
  const currPending = countFilesByStatus(state.files, 'pending');
  const prevPending = countFilesByStatus(prevState.files, 'pending');

  const currUploading = countFilesByStatus(state.files, 'uploading');
  const prevUploading = countFilesByStatus(prevState.files, 'uploading');

  // Trigger the queue if new files were added (pending increased) 
  // or if a file finished/paused (uploading decreased freeing a slot)
  if (currPending > prevPending || currUploading < prevUploading) {
    processUploadQueue();
  }
});
