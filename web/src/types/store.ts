export interface UploadFile {
  id: string;
  name: string;
  size: number;
  file?: File;
  progress: number;
  status: 'pending' | 'uploading' | 'paused' | 'error' | 'completed';
  uploadId?: string;
  uploadedChunks: number[];
  errorMessage?: string;
  previewUrl?: string;
}

export interface UploaderState {
  files: UploadFile[];
  addFiles: (files: File[]) => Promise<void>;
  updateFile: (id: string, data: Partial<UploadFile>) => void;
  removeFile: (id: string) => void;
  pauseUpload: (id: string) => void;
  resumeUpload: (id: string) => void;
  cancelUpload: (id: string) => void;
}
