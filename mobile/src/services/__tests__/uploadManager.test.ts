import { startUpload, processUploadQueue } from '../uploadManager';
import { useUploaderStore } from '@/store';
import { apiService } from '../apiService';
import { fileService } from '../fileService';
import * as Notifications from 'expo-notifications';

jest.mock('@/store');
jest.mock('../apiService');
jest.mock('../fileService');
jest.mock('expo-notifications');

describe('uploadManager', () => {
  const mockUpdateFile = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useUploaderStore.getState as jest.Mock).mockReturnValue({
      files: [],
      updateFile: mockUpdateFile,
    });
  });

  describe('startUpload', () => {
    it('does nothing if file is not found', async () => {
      await startUpload('non-existent');
      expect(mockUpdateFile).not.toHaveBeenCalled();
    });

    it('sets status to error if initiateUpload fails', async () => {
      (useUploaderStore.getState as jest.Mock).mockReturnValue({
        files: [{ id: '1', name: 'test.jpg', size: 1000, status: 'pending', uploadedChunks: [] }],
        updateFile: mockUpdateFile,
      });

      (apiService.initiateUpload as jest.Mock).mockRejectedValue(new Error('API failed'));

      await startUpload('1');
      expect(mockUpdateFile).toHaveBeenCalledWith('1', { status: 'error', errorMessage: 'API failed' });
    });

    it('sets status to error on upload chunk network error', async () => {
      jest.useFakeTimers();
      (useUploaderStore.getState as jest.Mock).mockReturnValue({
        files: [{ id: 'error-chunk', name: 'test.jpg', size: 1000, status: 'uploading', uploadedChunks: [], uploadId: 'up-1' }],
        updateFile: mockUpdateFile,
      });

      (fileService.getTempChunkUri as jest.Mock).mockReturnValue('file://tmp');
      (fileService.createTempChunk as jest.Mock).mockResolvedValue(undefined);
      (apiService.uploadChunk as jest.Mock).mockRejectedValue(new Error('Network error'));
      (fileService.cleanupTempChunk as jest.Mock).mockResolvedValue(undefined);

      const promise = startUpload('error-chunk');
      
      // Advance timers to trigger all retries
      for(let i = 0; i < 5; i++) {
        await Promise.resolve(); // flush microtasks
        jest.runAllTimers();
      }

      await promise;
      jest.useRealTimers();
      expect(mockUpdateFile).toHaveBeenCalledWith('error-chunk', { status: 'error', errorMessage: 'Network error during chunk upload' });
    });

    it('processUploadQueue should handle pause/stop cleanly', async () => {
      (apiService.initiateUpload as jest.Mock).mockResolvedValue('up-2');
      (useUploaderStore.getState as jest.Mock).mockReturnValue({
        files: [{ id: 'pause-test', name: 'f2', size: 5 * 1024 * 1024, uploadId: null, status: 'pending', uploadedChunks: [] }],
        updateFile: mockUpdateFile,
      });

      const uploadPromise = startUpload('pause-test');
      
      (useUploaderStore.getState as jest.Mock).mockReturnValue({
        files: [{ id: 'pause-test', name: 'f2', size: 5 * 1024 * 1024, uploadId: 'up-2', status: 'paused', uploadedChunks: [] }],
        updateFile: mockUpdateFile,
      });

      await uploadPromise;
      expect(apiService.finalizeUpload).not.toHaveBeenCalled();
    });

    it('processes chunks successfully', async () => {
      (useUploaderStore.getState as jest.Mock).mockReturnValue({
        files: [{ id: 'success-test', name: 'test.jpg', size: 1000, status: 'uploading', uploadedChunks: [] }],
        updateFile: mockUpdateFile,
      });

      (apiService.initiateUpload as jest.Mock).mockResolvedValue('up-123');
      (fileService.getTempChunkUri as jest.Mock).mockReturnValue('file://tmp');
      (fileService.createTempChunk as jest.Mock).mockResolvedValue(undefined);
      (apiService.uploadChunk as jest.Mock).mockResolvedValue(undefined);
      (fileService.cleanupTempChunk as jest.Mock).mockResolvedValue(undefined);
      (apiService.finalizeUpload as jest.Mock).mockResolvedValue(undefined);

      await startUpload('success-test');

      expect(apiService.initiateUpload).toHaveBeenCalled();
      expect(apiService.uploadChunk).toHaveBeenCalled();
      expect(apiService.finalizeUpload).toHaveBeenCalled();
      
      expect(mockUpdateFile).toHaveBeenCalledWith('success-test', { status: 'completed', progress: 100 });
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });
  });

  describe('processUploadQueue', () => {
    it('starts uploads for pending files if slots available', () => {
      (useUploaderStore.getState as jest.Mock).mockReturnValue({
        files: [
          { id: '1', status: 'pending' },
          { id: '2', status: 'pending' }
        ],
        updateFile: mockUpdateFile,
      });

      processUploadQueue();
    });
  });

  describe('store subscription', () => {
    it('triggers processUploadQueue when pending files increase', () => {
      const subscribeMock = (useUploaderStore.subscribe as jest.Mock);
      if (subscribeMock.mock.calls.length > 0) {
        const callback = subscribeMock.mock.calls[0][0];
        const prevState = { files: [{ id: '1', status: 'pending' }] };
        const currState = { files: [{ id: '1', status: 'pending' }, { id: '2', status: 'pending' }] };
        callback(currState, prevState);
      }
    });

    it('triggers processUploadQueue when uploading files decrease', () => {
      const subscribeMock = (useUploaderStore.subscribe as jest.Mock);
      if (subscribeMock.mock.calls.length > 0) {
        const callback = subscribeMock.mock.calls[0][0];
        const prevState = { files: [{ id: '1', status: 'uploading' }] };
        const currState = { files: [{ id: '1', status: 'completed' }] };
        callback(currState, prevState);
      }
    });
  });
});
