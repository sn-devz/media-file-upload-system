import { useUploaderStore } from '../uploaderStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('uploaderStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useUploaderStore.setState({ files: [] });
  });

  it('should add files correctly with default properties', () => {
    const store = useUploaderStore.getState();
    store.addFiles([
      { uri: 'file1', name: 'image1.jpg', size: 1000, mimeType: 'image/jpeg' }
    ]);

    const files = useUploaderStore.getState().files;
    expect(files.length).toBe(1);
    expect(files[0].uri).toBe('file1');
    expect(files[0].status).toBe('pending');
    expect(files[0].progress).toBe(0);
    expect(files[0].uploadedChunks).toEqual([]);
    expect(files[0].id).toBeDefined();
  });

  it('should update file properties', () => {
    useUploaderStore.getState().addFiles([
      { uri: 'file1', name: 'image1.jpg', size: 1000, mimeType: 'image/jpeg' }
    ]);

    const fileId = useUploaderStore.getState().files[0].id;
    
    useUploaderStore.getState().updateFile(fileId, { progress: 50, status: 'uploading' });

    const updatedFile = useUploaderStore.getState().files.find(f => f.id === fileId);
    expect(updatedFile?.progress).toBe(50);
    expect(updatedFile?.status).toBe('uploading');
  });

  it('should pause an upload', () => {
    useUploaderStore.getState().addFiles([
      { uri: 'file1', name: 'image1.jpg', size: 1000, mimeType: 'image/jpeg' }
    ]);

    const fileId = useUploaderStore.getState().files[0].id;
    
    useUploaderStore.getState().pauseUpload(fileId);

    const pausedFile = useUploaderStore.getState().files.find(f => f.id === fileId);
    expect(pausedFile?.status).toBe('paused');
  });

  it('should resume an upload', () => {
    useUploaderStore.getState().addFiles([
      { uri: 'file1', name: 'image1.jpg', size: 1000, mimeType: 'image/jpeg' }
    ]);

    const fileId = useUploaderStore.getState().files[0].id;
    useUploaderStore.getState().pauseUpload(fileId);
    useUploaderStore.getState().resumeUpload(fileId);

    const resumedFile = useUploaderStore.getState().files.find(f => f.id === fileId);
    expect(resumedFile?.status).toBe('pending');
  });

  it('should cancel an upload', () => {
    useUploaderStore.getState().addFiles([
      { uri: 'file1', name: 'image1.jpg', size: 1000, mimeType: 'image/jpeg' }
    ]);

    const fileId = useUploaderStore.getState().files[0].id;
    useUploaderStore.getState().cancelUpload(fileId);

    const cancelledFile = useUploaderStore.getState().files.find(f => f.id === fileId);
    expect(cancelledFile?.status).toBe('error');
    expect(cancelledFile?.errorMessage).toBe('Canceled');
  });

  it('should remove a file', () => {
    useUploaderStore.getState().addFiles([
      { uri: 'file1', name: 'image1.jpg', size: 1000, mimeType: 'image/jpeg' }
    ]);

    const fileId = useUploaderStore.getState().files[0].id;
    expect(useUploaderStore.getState().files.length).toBe(1);

    useUploaderStore.getState().removeFile(fileId);
    expect(useUploaderStore.getState().files.length).toBe(0);
  });
});
