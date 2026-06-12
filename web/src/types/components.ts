import React from 'react';
import type { ButtonProps } from 'antd';
import { UploadFile } from '@/types';

export interface ActionButtonProps extends ButtonProps {
  icon: React.ReactNode;
}

export interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

export interface FileListItemProps {
  file: UploadFile;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
}

export interface UploadListProps {
  files: UploadFile[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
}
