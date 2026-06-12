import React from 'react';
import { render, screen } from '@testing-library/react';
import UploadList from '../UploadList';
import { UploadFile } from '@/types';

// Mock FileListItem
jest.mock('../FileListItem', () => {
  return function MockFileListItem({ file }: any) {
    return <div data-testid="file-item">{file.name}</div>;
  };
});

describe('UploadList', () => {
  const defaultProps = {
    onPause: jest.fn(),
    onResume: jest.fn(),
    onCancel: jest.fn(),
    onRemove: jest.fn(),
  };

  it('renders nothing when files array is empty', () => {
    const { container } = render(<UploadList files={[]} {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a list of files when provided', () => {
    const files: UploadFile[] = [
      { id: '1', name: 'file1.png', size: 100, progress: 0, status: 'pending', uploadedChunks: [] },
      { id: '2', name: 'file2.jpg', size: 200, progress: 50, status: 'uploading', uploadedChunks: [] }
    ];

    render(<UploadList files={files} {...defaultProps} />);
    
    expect(screen.getByText('Upload Queue')).toBeInTheDocument();
    
    const items = screen.getAllByTestId('file-item');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('file1.png');
    expect(items[1]).toHaveTextContent('file2.jpg');
  });
});
