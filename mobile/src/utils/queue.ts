import { MobileUploadFile } from '@/types';

export const countFilesByStatus = (files: MobileUploadFile[], status: MobileUploadFile['status']): number => {
  return files.filter(f => f.status === status).length;
};

export const getFilesByStatus = (files: MobileUploadFile[], status: MobileUploadFile['status']): MobileUploadFile[] => {
  return files.filter(f => f.status === status);
};

export const getFilesToStart = (
  pendingFiles: MobileUploadFile[], 
  activeCount: number, 
  maxConcurrent: number
): MobileUploadFile[] => {
  if (activeCount >= maxConcurrent) return [];
  const availableSlots = maxConcurrent - activeCount;
  return pendingFiles.slice(0, availableSlots);
};
