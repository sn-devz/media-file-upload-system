import { calculatePercentage, calculateChunkLength, calculateTotalChunks, calculateOverallProgress } from '../math';
import { MobileUploadFile } from '@/types';

describe('math utilities', () => {
  describe('calculatePercentage', () => {
    it('should correctly calculate the percentage', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(100, 100)).toBe(100);
      expect(calculatePercentage(0, 100)).toBe(0);
    });

    it('should return 0 when total is 0 to avoid division by zero', () => {
      expect(calculatePercentage(50, 0)).toBe(0);
      expect(calculatePercentage(0, 0)).toBe(0);
    });
  });

  describe('calculateChunkLength', () => {
    it('should return CHUNK_SIZE if remaining size is greater than CHUNK_SIZE', () => {
      expect(calculateChunkLength(5000, 1000, 1000)).toBe(1000);
    });

    it('should return remaining size if less than CHUNK_SIZE', () => {
      expect(calculateChunkLength(1500, 1000, 1000)).toBe(500);
    });

    it('should handle exact bounds', () => {
      expect(calculateChunkLength(2000, 1000, 1000)).toBe(1000);
    });
  });

  describe('calculateTotalChunks', () => {
    it('should correctly calculate total chunks for exact divisions', () => {
      expect(calculateTotalChunks(2000, 1000)).toBe(2);
    });

    it('should correctly round up total chunks for partial divisions', () => {
      expect(calculateTotalChunks(2500, 1000)).toBe(3);
    });

    it('should return 0 when size is 0', () => {
      expect(calculateTotalChunks(0, 1000)).toBe(0);
    });
  });

  describe('calculateOverallProgress', () => {
    it('should calculate 0 if no files', () => {
      expect(calculateOverallProgress([])).toBe(0);
    });

    it('should calculate correct overall progress based on file sizes and their individual progress', () => {
      const files: Partial<MobileUploadFile>[] = [
        { size: 100, progress: 50 },
        { size: 300, progress: 100 },
      ];
      // total size = 400
      // uploaded bytes = (100 * 0.5) + (300 * 1.0) = 50 + 300 = 350
      // 350 / 400 = 0.875 * 100 = 87.5
      expect(calculateOverallProgress(files as MobileUploadFile[])).toBe(87.5);
    });

    it('should return 0 if total size is 0', () => {
      const files: Partial<MobileUploadFile>[] = [
        { size: 0, progress: 50 },
      ];
      expect(calculateOverallProgress(files as MobileUploadFile[])).toBe(0);
    });
  });
});
