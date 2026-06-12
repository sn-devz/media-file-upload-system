import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 }, 
    { duration: '20s', target: 5 }, 
    { duration: '10s', target: 0 }, 
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% of requests must complete below 300ms
  },
};

export default function () {
  const url = 'http://localhost:8000/api/upload';
  
  // 1. Initiate Upload
  const initRes = http.post(`${url}/initiate`, JSON.stringify({
    filename: `stress_file_${__VU}.jpg`,
    total_chunks: 5,
    total_size: 5000000,
    checksum: 'fakehash123'
  }), { headers: { 'Content-Type': 'application/json' } });
  
  check(initRes, { 'initiated successfully': (r) => r.status === 200 });
  
  const uploadId = initRes.json('upload_id');
  if (!uploadId) return;

  // 2. Upload 5 chunks sequentially per VU
  for (let i = 0; i < 5; i++) {
    // 1MB Fake Chunk
    const chunkData = new ArrayBuffer(1024 * 1024); 
    
    const chunkRes = http.post(`${url}/chunk/${uploadId}`, {
      chunk_index: i,
      chunk: http.file(chunkData, 'chunk.bin')
    });
    
    check(chunkRes, { 'chunk uploaded': (r) => r.status === 200 });
    sleep(0.1); // Small delay
  }

  // 3. Finalize Upload
  const finalizeRes = http.post(`${url}/finalize/${uploadId}`);
  check(finalizeRes, { 'finalized successfully': (r) => r.status === 200 });
}
