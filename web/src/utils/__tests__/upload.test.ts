import { calculateMD5 } from '../upload';

describe('upload utils', () => {
  describe('calculateMD5', () => {
    it('should successfully calculate MD5 hash of a file', async () => {
      // Create a dummy file with deterministic content
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      const checksum = await calculateMD5(file);
      
      // 'test content' md5 is '9473fdd0d880a43c21b7778d34872157'
      expect(checksum).toBe('9473fdd0d880a43c21b7778d34872157');
    });

    it('should reject if file reading fails', async () => {
      // Mock FileReader to simulate an error
      const mockFileReader = {
        readAsArrayBuffer: jest.fn(function(this: any) {
          if (this.onerror) {
            this.error = new Error('Simulated read error');
            this.onerror(new ProgressEvent('error'));
          }
        }),
      } as any;
      
      jest.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader);

      const file = new File(['fail'], 'fail.txt', { type: 'text/plain' });
      
      await expect(calculateMD5(file)).rejects.toThrow('Simulated read error');
      
      jest.restoreAllMocks();
    });
  });
});
