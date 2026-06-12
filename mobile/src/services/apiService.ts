import axios from 'axios';
import { Platform } from 'react-native';

const iOSUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/upload';
const androidUrl = process.env.EXPO_PUBLIC_ANDROID_API_URL || 'http://10.0.2.2:8000/api/upload';
const API_BASE_URL = Platform.OS === 'android' ? androidUrl : iOSUrl;

export const apiService = {
  initiateUpload: async (filename: string, totalChunks: number, totalSize: number) => {
    const checksum = filename + '_' + totalSize;
    const response = await axios.post(`${API_BASE_URL}/initiate`, {
      filename,
      total_chunks: totalChunks,
      total_size: totalSize,
      checksum
    });
    return response.data.upload_id as string;
  },

  uploadChunk: async (uploadId: string, chunkIndex: number, tempChunkUri: string) => {
    const formData = new FormData();
    formData.append('chunk_index', chunkIndex.toString());
    // @ts-ignore - React Native FormData accepts an object with uri
    formData.append('chunk', {
      uri: tempChunkUri,
      name: `chunk_${chunkIndex}`,
      type: 'application/octet-stream',
    });

    await axios.post(`${API_BASE_URL}/chunk/${uploadId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  finalizeUpload: async (uploadId: string) => {
    await axios.post(`${API_BASE_URL}/finalize/${uploadId}`);
  }
};
