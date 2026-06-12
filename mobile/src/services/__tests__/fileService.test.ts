import { fileService } from '../fileService';
import * as FileSystem from 'expo-file-system/legacy';

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file://cache/',
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  EncodingType: { Base64: 'base64' }
}));

describe('fileService', () => {
  it('getTempChunkUri', () => {
    expect(fileService.getTempChunkUri('upload1', 5)).toBe('file://cache/chunk_upload1_5');
  });

  it('createTempChunk', async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64');
    
    await fileService.createTempChunk('file://test.jpg', 0, 100, 'file://temp');
    
    expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith('file://test.jpg', {
      encoding: 'base64',
      position: 0,
      length: 100
    });
    
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith('file://temp', 'base64', {
      encoding: 'base64'
    });
  });

  it('cleanupTempChunk', async () => {
    await fileService.cleanupTempChunk('file://temp');
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith('file://temp', { idempotent: true });
  });
});
