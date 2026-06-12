import React from 'react';

import { render, fireEvent, screen, act, waitFor } from '@testing-library/react';
import UploadManager from '../UploadManager';
import { message } from 'antd';
import { useUploaderStore } from '../../../store/uploaderStore';

jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    message: {
      error: jest.fn(),
      success: jest.fn(),
    },
  };
});

jest.mock('lucide-react', () => ({
  UploadCloud: () => <div>UploadCloud</div>,
  Pause: () => <div>Pause</div>,
  Play: () => <div>Play</div>,
  X: () => <div>X</div>,
  AlertCircle: () => <div>AlertCircle</div>,
}));

window.URL.createObjectURL = jest.fn(() => 'blob:test');

jest.mock('../../../hooks/useUploader', () => ({
  useUploader: jest.fn(),
}));

jest.mock('../../molecules/FileListItem', () => () => <div data-testid="file-list-item" />);

describe('UploadManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUploaderStore.setState({ files: [] });
  });

  it('renders Dropzone successfully', () => {
    render(<UploadManager />);
    expect(screen.getByText(/Drag & Drop Media Files/i)).toBeInTheDocument();
  });

  it('rejects files exceeding size limit', () => {
    const { container } = render(<UploadManager />);
    
    // Create an oversized file
    const hugeFile = new File([''], 'huge.png', { type: 'image/png' });
    Object.defineProperty(hugeFile, 'size', { value: 60 * 1024 * 1024 }); // 60MB

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [hugeFile] } });
    
    expect(message.error).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining('exceeds the 50MB size limit') }));
    expect(useUploaderStore.getState().files.length).toBe(0);
  });

  it('rejects invalid file types', () => {
    const { getByText } = render(<UploadManager />);
    
    // Ant Design's Dragger wraps the input in a hidden file input
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).not.toBeNull();

    const invalidFile = new File(['dummy'], 'doc.pdf', { type: 'application/pdf' });
    
    fireEvent.change(input, { target: { files: [invalidFile] } });
    
    expect(message.error).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining('is an invalid type') }));
    expect(useUploaderStore.getState().files.length).toBe(0);
  });

  it('adds valid files to the store', async () => {
    const { getByText } = render(<UploadManager />);
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['dummy'], 'image.png', { type: 'image/png' });
    
    fireEvent.change(input, { target: { files: [validFile] } });
    
    await waitFor(() => {
      expect(useUploaderStore.getState().files.length).toBe(1);
    });
    expect(useUploaderStore.getState().files[0].name).toBe('image.png');
  });

  it('rejects adding more than 10 files at once', () => {
    const { getByText } = render(<UploadManager />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    const files = Array(11).fill(null).map((_, i) => 
      new File(['dummy'], `image${i}.png`, { type: 'image/png' })
    );
    
    fireEvent.change(input, { target: { files } });
    
    expect(message.error).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining('You can only select up to 10 files at once.') }));
    expect(useUploaderStore.getState().files.length).toBe(0);
  });
});
