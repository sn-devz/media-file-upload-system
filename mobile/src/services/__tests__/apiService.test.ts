import { apiService } from '../apiService';
import axios from 'axios';

jest.mock('axios');

describe('apiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initiateUpload', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: { upload_id: 'up-1' } });
    const result = await apiService.initiateUpload('test.jpg', 10, 1000);
    expect(result).toBe('up-1');
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/initiate'), expect.any(Object));
  });

  it('uploadChunk', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: {} });
    await apiService.uploadChunk('up-1', 0, 'file://tmp');
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/chunk/up-1'), expect.any(FormData), expect.any(Object));
  });

  it('finalizeUpload', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: {} });
    await apiService.finalizeUpload('up-1');
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/finalize/up-1'));
  });
});
