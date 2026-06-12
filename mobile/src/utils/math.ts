import { MobileUploadFile } from '@/types';

export const calculatePercentage = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

export const calculateChunkLength = (fileSize: number, startPosition: number, chunkSize: number): number => {
  return Math.min(chunkSize, fileSize - startPosition);
};

export const calculateTotalChunks = (fileSize: number, chunkSize: number): number => {
  return Math.ceil(fileSize / chunkSize);
};

export const calculateOverallProgress = (files: MobileUploadFile[]): number => {
  if (files.length === 0) return 0;
  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
  const uploadedBytes = files.reduce((acc, f) => acc + (f.size * (f.progress / 100)), 0);
  return totalBytes > 0 ? (uploadedBytes / totalBytes) * 100 : 0;
};
