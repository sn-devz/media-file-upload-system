import axios from 'axios';
import { initiateUpload, uploadChunkWithRetry, finalizeUpload } from '../uploadApi';
import { API_BASE_URL } from '@utils';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('uploadApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initiateUpload', () => {
    it('should successfully initiate an upload and return uploadId', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { upload_id: 'test-upload-id' } });

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const uploadId = await initiateUpload(file, 2, 'fake-checksum');

      expect(uploadId).toBe('test-upload-id');
      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_BASE_URL}/initiate`, {
        filename: 'test.png',
        total_chunks: 2,
        total_size: file.size,
        checksum: 'fake-checksum'
      });
    });
  });

  describe('uploadChunkWithRetry', () => {
    it('should successfully upload a chunk on the first attempt', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      const blob = new Blob(['chunk-data']);
      await uploadChunkWithRetry('test-upload-id', blob, 0);

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post.mock.calls[0][0]).toBe(`${API_BASE_URL}/chunk/test-upload-id`);
      expect(mockedAxios.post.mock.calls[0][1]).toBeInstanceOf(FormData);
    });

    it('should retry on failure and succeed if it eventually passes', async () => {
      mockedAxios.post
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce({ data: { success: true } });

      const blob = new Blob(['chunk-data']);
      await uploadChunkWithRetry('test-upload-id', blob, 1);

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('should throw an error if all retries fail', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network Error'));

      const blob = new Blob(['chunk-data']);
      await expect(uploadChunkWithRetry('test-upload-id', blob, 2)).rejects.toThrow('Network error during chunk upload');

      // The exact number of calls depends on MAX_RETRIES (3 by default)
      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
    }, 10000);
  });

  describe('finalizeUpload', () => {
    it('should successfully finalize an upload', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      await finalizeUpload('test-upload-id');

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_BASE_URL}/finalize/test-upload-id`);
    });
  });
});
