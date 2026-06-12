import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UploaderState } from '@/types';
import { generateThumbnail } from '@utils';

export const useUploaderStore = create<UploaderState>()(
  persist(
    (set) => ({
      files: [],
      addFiles: async (newFiles) => {
        const stateFiles = useUploaderStore.getState().files;
        
        const newUploadFiles = await Promise.all(newFiles.map(async file => {
          // Check if file already exists (same name and size)
          const existingFile = stateFiles.find(f => f.name === file.name && f.size === file.size);
          
          let previewUrl: string | undefined = undefined;
          if (file.type.startsWith('image/')) {
            try {
              previewUrl = await generateThumbnail(file);
            } catch {
              previewUrl = undefined;
            }
          }
          
          if (existingFile && existingFile.status !== 'completed') {
            return {
              ...existingFile,
              file,
              status: 'pending' as const,
              errorMessage: undefined,
              previewUrl: previewUrl || existingFile.previewUrl
            };
          }

          return {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            size: file.size,
            file,
            progress: 0,
            status: 'pending' as const,
            uploadedChunks: [],
            previewUrl
          };
        }));

        set((state) => {
          // Filter out the old versions of the files we are replacing/resuming
          const replacedIds = newUploadFiles.map(f => f.id);
          const remainingFiles = state.files.filter(f => !replacedIds.includes(f.id));
          return { files: [...remainingFiles, ...newUploadFiles] };
        });
      },
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
        files: state.files.map(f => {
          if (f.id === id) {
            if (!f.file) {
              return { ...f, status: 'error' as const, errorMessage: 'File missing. Please re-select the file to resume.' };
            }
            return { ...f, status: 'pending' as const };
          }
          return f;
        })
      })),
      cancelUpload: (id) => set((state) => ({
        files: state.files.map(f => f.id === id ? { ...f, status: 'error' as const, errorMessage: 'Canceled' } : f)
      }))
    }),
    {
      name: 'web-uploader-storage',
      partialize: (state) => ({
        files: state.files.map(({ file, ...rest }) => ({
          ...rest,
          status: (rest.status === 'uploading' || rest.status === 'pending') ? 'error' : rest.status,
          errorMessage: (rest.status === 'uploading' || rest.status === 'pending') ? 'Upload interrupted. Please re-select file to resume.' : rest.errorMessage,
        }))
      })
    }
  )
);
