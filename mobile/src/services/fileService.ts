import * as FileSystem from 'expo-file-system/legacy';

export const fileService = {
  getTempChunkUri: (uploadId: string, chunkIndex: number) => {
    return FileSystem.cacheDirectory + `chunk_${uploadId}_${chunkIndex}`;
  },

  createTempChunk: async (fileUri: string, startPosition: number, length: number, tempUri: string) => {
    const base64Chunk = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
      position: startPosition,
      length: length,
    });
    
    await FileSystem.writeAsStringAsync(tempUri, base64Chunk, {
      encoding: FileSystem.EncodingType.Base64,
    });
  },

  cleanupTempChunk: async (tempUri: string) => {
    await FileSystem.deleteAsync(tempUri, { idempotent: true });
  }
};
