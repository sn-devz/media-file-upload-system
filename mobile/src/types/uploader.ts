export interface MobileUploadFile {
  id: string;
  uri: string;
  name: string;
  size: number;
  mimeType: string;
  progress: number;
  status: 'pending' | 'uploading' | 'paused' | 'error' | 'completed';
  uploadId?: string;
  uploadedChunks: number[];
  errorMessage?: string;
}

export type NewUploadFile = Omit<MobileUploadFile, 'id' | 'progress' | 'status' | 'uploadedChunks'>;

export interface UploaderState {
  files: MobileUploadFile[];
  addFiles: (files: NewUploadFile[]) => void;
  updateFile: (id: string, data: Partial<MobileUploadFile>) => void;
  removeFile: (id: string) => void;
  pauseUpload: (id: string) => void;
  resumeUpload: (id: string) => void;
  cancelUpload: (id: string) => void;
}
