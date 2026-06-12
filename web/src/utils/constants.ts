export const MAX_FILES = 10;
export const CHUNK_SIZE = 1024 * 1024; // 1MB
export const MAX_FILE_SIZE = 50 * CHUNK_SIZE; // 50MB

export const MAX_CONCURRENT_UPLOADS = 3;
export const MAX_RETRIES = 3;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/upload';
