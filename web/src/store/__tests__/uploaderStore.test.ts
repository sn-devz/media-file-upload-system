import { useUploaderStore } from '../uploaderStore';
import { act } from '@testing-library/react';

describe('uploaderStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { files, removeFile } = useUploaderStore.getState();
    files.forEach(f => removeFile(f.id));
  });

  it('should add files correctly', async () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    await act(async () => {
      await useUploaderStore.getState().addFiles([file]);
    });
    
    const { files } = useUploaderStore.getState();
    expect(files.length).toBe(1);
    expect(files[0].file!.name).toBe('test.png');
    expect(files[0].status).toBe('pending');
  });

  it('should pause upload', async () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    await act(async () => {
      await useUploaderStore.getState().addFiles([file]);
    });
    
    const { files, updateFile, pauseUpload } = useUploaderStore.getState();
    const id = files[0].id;
    
    // Simulate it started uploading
    act(() => { updateFile(id, { status: 'uploading' }); });
    expect(useUploaderStore.getState().files[0].status).toBe('uploading');
    
    // Pause it
    act(() => { pauseUpload(id); });
    expect(useUploaderStore.getState().files[0].status).toBe('paused');
  });

  it('should cancel upload', async () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    await act(async () => {
      await useUploaderStore.getState().addFiles([file]);
    });
    
    const { files, cancelUpload } = useUploaderStore.getState();
    const id = files[0].id;
    
    // Cancel it
    act(() => { cancelUpload(id); });
    expect(useUploaderStore.getState().files[0].status).toBe('error');
    expect(useUploaderStore.getState().files[0].errorMessage).toBe('Canceled');
  });
  it('should resume upload if file is present', async () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    await act(async () => {
      await useUploaderStore.getState().addFiles([file]);
    });
    
    const { files, pauseUpload, resumeUpload } = useUploaderStore.getState();
    const id = files[0].id;
    
    act(() => { pauseUpload(id); });
    expect(useUploaderStore.getState().files[0].status).toBe('paused');
    
    act(() => { resumeUpload(id); });
    expect(useUploaderStore.getState().files[0].status).toBe('pending');
  });

  it('should fail to resume upload if file is missing (e.g. from localstorage rehydration)', () => {
    useUploaderStore.setState({
      files: [{
        id: '123',
        name: 'test.png',
        size: 100,
        progress: 0,
        status: 'paused',
        uploadedChunks: []
      }]
    });

    const { resumeUpload } = useUploaderStore.getState();
    
    act(() => { resumeUpload('123'); });
    
    const file = useUploaderStore.getState().files[0];
    expect(file.status).toBe('error');
    expect(file.errorMessage).toContain('File missing');
  });
});
