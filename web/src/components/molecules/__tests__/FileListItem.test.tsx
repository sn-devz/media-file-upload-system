import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import FileListItem from '../FileListItem';
import { UploadFile } from '@/types';

// Mock ActionButton to simplify testing
jest.mock('../../atoms/ActionButton', () => {
  return function MockActionButton({ onClick, 'aria-label': ariaLabel }: any) {
    return <button onClick={onClick} aria-label={ariaLabel}>{ariaLabel}</button>;
  };
});

describe('FileListItem', () => {
  const mockFile: UploadFile = {
    id: '1',
    name: 'test-video.mp4',
    size: 1024 * 1024 * 5, // 5MB
    progress: 0,
    status: 'pending',
    uploadedChunks: [],
    file: new File([''], 'test-video.mp4', { type: 'video/mp4' })
  };

  const defaultProps = {
    file: mockFile,
    onPause: jest.fn(),
    onResume: jest.fn(),
    onCancel: jest.fn(),
    onRemove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pending state correctly', () => {
    render(<FileListItem {...defaultProps} />);
    expect(screen.getByText('test-video.mp4')).toBeInTheDocument();
    expect(screen.getByText('0.00 MB')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    
    // Should show Cancel button
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders uploading state and pause button', () => {
    render(<FileListItem {...defaultProps} file={{ ...mockFile, status: 'uploading', progress: 45 }} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
    
    const pauseButton = screen.getByRole('button', { name: 'Pause' });
    fireEvent.click(pauseButton);
    expect(defaultProps.onPause).toHaveBeenCalledWith('1');
  });

  it('renders paused state and resume button', () => {
    render(<FileListItem {...defaultProps} file={{ ...mockFile, status: 'paused', progress: 45 }} />);
    expect(screen.getByText('paused')).toBeInTheDocument();
    
    const resumeButton = screen.getByRole('button', { name: 'Resume' });
    fireEvent.click(resumeButton);
    expect(defaultProps.onResume).toHaveBeenCalledWith('1');
  });

  it('renders error state correctly', () => {
    render(<FileListItem {...defaultProps} file={{ ...mockFile, status: 'error', errorMessage: 'Network Error' }} />);
    expect(screen.getByText('Network Error')).toBeInTheDocument();
    
    const removeButton = screen.getByRole('button', { name: 'Remove' });
    fireEvent.click(removeButton);
    expect(defaultProps.onRemove).toHaveBeenCalledWith('1');
  });

  it('renders completed state correctly', () => {
    render(<FileListItem {...defaultProps} file={{ ...mockFile, status: 'completed', progress: 100 }} />);
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    
    const removeButton = screen.getByRole('button', { name: 'Remove' });
    expect(removeButton).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<FileListItem {...defaultProps} file={{ ...mockFile, status: 'uploading' }} />);
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    expect(defaultProps.onCancel).toHaveBeenCalledWith('1');
  });
});
