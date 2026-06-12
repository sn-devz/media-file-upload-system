import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileUploadFile, UploaderState } from '@/types';

export const useUploaderStore = create<UploaderState>()(
  persist(
    (set) => ({
  files: [],
  addFiles: (newFiles) => set((state) => {
    const newUploadFiles: MobileUploadFile[] = newFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substring(7),
      progress: 0,
      status: 'pending' as const,
      uploadedChunks: [],
    }));
    return { files: [...state.files, ...newUploadFiles] };
  }),
  updateFile: (id, data) => set((state) => ({
    files: state.files.map(f => f.id === id ? { ...f, ...data } : f)
  })),
  removeFile: (id) => set((state) => ({
    files: state.files.filter(f => f.id !== id)
  })),
  pauseUpload: (id) => set((state) => ({
    files: state.files.map(f => f.id === id ? { ...f, status: 'paused' as const } : f)
  })),
  resumeUpload: (id) => set((state) => ({
    files: state.files.map(f => f.id === id ? { ...f, status: 'pending' as const } : f)
  })),
  cancelUpload: (id) => set((state) => ({
    files: state.files.map(f => f.id === id ? { ...f, status: 'error' as const, errorMessage: 'Canceled' } : f)
  }))
    }),
    {
      name: 'mobile-uploader-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
