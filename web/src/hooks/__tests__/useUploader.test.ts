import { renderHook } from '@testing-library/react';
import { useUploader } from '../useUploader';
import { useUploaderStore } from '../../store/uploaderStore';
import axios from 'axios';
import { act } from '@testing-library/react';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('useUploader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUploaderStore.setState({ files: [] });
  });

  it('should initialize and process a file', async () => {
    // Setup file
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 * 1.5 }); // 1.5MB to require 2 chunks

    await useUploaderStore.getState().addFiles([file]);

    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/initiate')) {
        return Promise.resolve({ data: { upload_id: 'test-upload-id' } });
      }
      if (url.includes('/chunk')) {
        return Promise.resolve({ data: { success: true } });
      }
      if (url.includes('/finalize')) {
        return Promise.resolve({ data: { success: true } });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    renderHook(() => useUploader());

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    const files = useUploaderStore.getState().files;
    expect(files[0].status).toBe('completed');
    expect(files[0].progress).toBe(100);
    expect(mockedAxios.post).toHaveBeenCalledTimes(4); // 1 init + 2 chunks + 1 finalize
  });

  it('should handle missing file object', async () => {
    useUploaderStore.setState({
      files: [{
        id: '123',
        name: 'test.png',
        size: 100,
        progress: 0,
        status: 'pending',
        uploadedChunks: []
      }]
    });

    renderHook(() => useUploader());
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const files = useUploaderStore.getState().files;
    expect(files[0].status).toBe('error');
    expect(files[0].errorMessage).toContain('File missing');
  });
});
