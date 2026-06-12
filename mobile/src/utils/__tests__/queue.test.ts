import { countFilesByStatus, getFilesByStatus, getFilesToStart } from '../queue';
import { MobileUploadFile } from '@/types';

describe('queue utilities', () => {
  const mockFiles: Partial<MobileUploadFile>[] = [
    { id: '1', status: 'pending' },
    { id: '2', status: 'uploading' },
    { id: '3', status: 'uploading' },
    { id: '4', status: 'completed' },
    { id: '5', status: 'pending' },
  ];

  describe('countFilesByStatus', () => {
    it('should correctly count files with a specific status', () => {
      expect(countFilesByStatus(mockFiles as MobileUploadFile[], 'pending')).toBe(2);
      expect(countFilesByStatus(mockFiles as MobileUploadFile[], 'uploading')).toBe(2);
      expect(countFilesByStatus(mockFiles as MobileUploadFile[], 'completed')).toBe(1);
      expect(countFilesByStatus(mockFiles as MobileUploadFile[], 'error')).toBe(0);
    });
  });

  describe('getFilesByStatus', () => {
    it('should return files that match the requested status', () => {
      const uploadingFiles = getFilesByStatus(mockFiles as MobileUploadFile[], 'uploading');
      expect(uploadingFiles.length).toBe(2);
      expect(uploadingFiles.map(f => f.id)).toEqual(['2', '3']);
    });
  });

  describe('getFilesToStart', () => {
    it('should return empty array if no slots are available', () => {
      const pendingFiles = getFilesByStatus(mockFiles as MobileUploadFile[], 'pending');
      const filesToStart = getFilesToStart(pendingFiles, 3, 3);
      expect(filesToStart.length).toBe(0);
    });

    it('should return exactly the amount of available slots', () => {
      const pendingFiles = getFilesByStatus(mockFiles as MobileUploadFile[], 'pending');
      const filesToStart = getFilesToStart(pendingFiles, 1, 3);
      expect(filesToStart.length).toBe(2); // 3 - 1 = 2 slots, there are exactly 2 pending
      expect(filesToStart.map(f => f.id)).toEqual(['1', '5']);
    });

    it('should cap out at the number of pending files if more slots than pending files exist', () => {
      const pendingFiles = getFilesByStatus(mockFiles as MobileUploadFile[], 'pending');
      const filesToStart = getFilesToStart(pendingFiles, 0, 5);
      expect(filesToStart.length).toBe(2);
    });
  });
});
