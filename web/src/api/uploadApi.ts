import axios from 'axios';
import { API_BASE_URL, MAX_RETRIES } from '@utils';

export const initiateUpload = async (file: File, totalChunks: number, checksum: string): Promise<string> => {
  const initRes = await axios.post(`${API_BASE_URL}/initiate`, {
    filename: file.name,
    total_chunks: totalChunks,
    total_size: file.size,
    checksum: checksum
  });
  return initRes.data.upload_id;
};

export const uploadChunkWithRetry = async (uploadId: string, chunk: Blob, chunkIndex: number): Promise<void> => {
  let attempt = 0;
  let success = false;
  
  while (attempt < MAX_RETRIES && !success) {
    try {
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('chunk_index', chunkIndex.toString());

      await axios.post(`${API_BASE_URL}/chunk/${uploadId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      success = true;
    } catch (e) {
      attempt++;
      if (attempt >= MAX_RETRIES) throw new Error('Network error during chunk upload');
      await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt)));
    }
  }
};

export const finalizeUpload = async (uploadId: string): Promise<void> => {
  await axios.post(`${API_BASE_URL}/finalize/${uploadId}`);
};
