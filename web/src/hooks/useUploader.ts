import { useEffect, useRef } from 'react';
import { notification } from 'antd';
import { useUploaderStore } from '@store';
import { UploadFile } from '@/types';
import { 
  CHUNK_SIZE, 
  MAX_CONCURRENT_UPLOADS, 
  calculateMD5 
} from '@utils';
import {
  initiateUpload, 
  uploadChunkWithRetry, 
  finalizeUpload
} from '@api';

export const useUploader = () => {
  const { files, updateFile } = useUploaderStore();
  const processingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const uploadingCount = files.filter(f => f.status === 'uploading').length;
    const pendingFiles = files.filter(f => f.status === 'pending');

    if (uploadingCount < MAX_CONCURRENT_UPLOADS && pendingFiles.length > 0) {
      const availableSlots = MAX_CONCURRENT_UPLOADS - uploadingCount;
      const filesToStart = pendingFiles.slice(0, availableSlots);

      filesToStart.forEach(file => {
        if (!processingRef.current.has(file.id)) {
          startUpload(file);
        }
      });
    }
  }, [files]);

  const startUpload = async (uploadFile: UploadFile) => {
    if (!uploadFile.file) {
      updateFile(uploadFile.id, { status: 'error', errorMessage: 'File missing. Re-select file.' });
      return;
    }

    processingRef.current.add(uploadFile.id);
    updateFile(uploadFile.id, { status: 'uploading' });

    try {
      const file = uploadFile.file;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploadId = uploadFile.uploadId;

      // Initiate if we don't have an uploadId
      if (!uploadId) {
        const checksum = await calculateMD5(file);
        uploadId = await initiateUpload(file, totalChunks, checksum);
        updateFile(uploadFile.id, { uploadId });
      }

      // Upload chunks
      let uploadedChunks = [...uploadFile.uploadedChunks];
      for (let i = 0; i < totalChunks; i++) {
        const currentFileState = useUploaderStore.getState().files.find(f => f.id === uploadFile.id);
        if (!currentFileState || currentFileState.status !== 'uploading') {
          processingRef.current.delete(uploadFile.id);
          return;
        }

        if (uploadedChunks.includes(i)) continue;

        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        await uploadChunkWithRetry(uploadId, chunk, i);

        uploadedChunks.push(i);
        const progress = Math.round((uploadedChunks.length / totalChunks) * 100);
        updateFile(uploadFile.id, { uploadedChunks, progress });
      }

      // Finalize
      await finalizeUpload(uploadId);
      updateFile(uploadFile.id, { status: 'completed', progress: 100 });
      notification.success({ 
        title: 'Upload Complete',
        description: `"${file.name}" uploaded successfully!`, 
        placement: 'topRight' 
      });

    } catch (error: any) {
      updateFile(uploadFile.id, { status: 'error', errorMessage: error.message || 'Upload failed' });
    } finally {
      processingRef.current.delete(uploadFile.id);
    }
  };
};
