import React from 'react';
import { useMediaController } from '../useMediaController';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

jest.mock('expo-image-picker');
jest.mock('expo-background-fetch');

const mockAddFiles = jest.fn();
jest.mock('@/store', () => ({
  useUploaderStore: () => ({
    files: [],
    addFiles: mockAddFiles,
    pauseUpload: jest.fn(),
    resumeUpload: jest.fn(),
    cancelUpload: jest.fn(),
    removeFile: jest.fn(),
  })
}));

jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useEffect: (cb: any) => cb(),
    useCallback: (cb: any) => cb,
    useMemo: (cb: any) => cb(),
  };
});

describe('useMediaController direct tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => { });
  });

  it('pickDocument adds files on success', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://img', fileName: 'test.jpg', mimeType: 'image/jpeg', fileSize: 1000 }],
    });

    const hook = useMediaController();
    await hook.pickDocument();
    expect(mockAddFiles).toHaveBeenCalled();
  });

  it('pickDocument alerts on large file', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://img', fileName: 'test.jpg', mimeType: 'image/jpeg', fileSize: 100000000 }],
    });

    const hook = useMediaController();
    await hook.pickDocument();
    expect(Alert.alert).toHaveBeenCalledWith('File Too Large', expect.any(String));
  });

  it('takePhoto adds files on success', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://img', fileName: 'test.jpg', mimeType: 'image/jpeg', fileSize: 1000 }],
    });

    const hook = useMediaController();
    await hook.takePhoto();
    expect(mockAddFiles).toHaveBeenCalled();
  });

  it('takePhoto alerts on permission denied', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });

    const hook = useMediaController();
    await hook.takePhoto();
    expect(Alert.alert).toHaveBeenCalledWith('Permission Required', expect.any(String));
  });

  it('pickDocument alerts on permission denied', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });

    const hook = useMediaController();
    await hook.pickDocument();
    expect(Alert.alert).toHaveBeenCalledWith('Permission Required', expect.any(String));
  });

  it('takePhoto alerts on large file', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://img', fileName: 'test.jpg', mimeType: 'image/jpeg', fileSize: 100000000 }],
    });

    const hook = useMediaController();
    await hook.takePhoto();
    expect(Alert.alert).toHaveBeenCalledWith('File Too Large', expect.any(String));
  });

  it('takePhoto handles simulator error gracefully', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.launchCameraAsync as jest.Mock).mockRejectedValue(new Error('simulator not available'));

    const hook = useMediaController();
    await hook.takePhoto();
    expect(Alert.alert).toHaveBeenCalledWith('Camera Unavailable', expect.any(String));
  });

  it('pickDocument adds files on success', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://img', fileName: 'test.jpg', mimeType: 'image/jpeg', fileSize: 1000 }],
    });

    const hook = useMediaController();
    await hook.pickDocument();
    expect(mockAddFiles).toHaveBeenCalled();
  });

  it('pickDocument alerts on large file', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://img', fileName: 'test.jpg', mimeType: 'image/jpeg', fileSize: 100000000 }],
    });

    const hook = useMediaController();
    await hook.pickDocument();
    expect(Alert.alert).toHaveBeenCalledWith('File Too Large', expect.any(String));
  });

  it('pickDocument alerts on permission denied', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });

    const hook = useMediaController();
    await hook.pickDocument();
    expect(Alert.alert).toHaveBeenCalledWith('Permission Required', expect.any(String));
  });

  it('pickDocument catches errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockRejectedValue(new Error('Unknown Error'));
    const hook = useMediaController();
    await hook.pickDocument();
    expect(consoleSpy).toHaveBeenCalledWith("Gallery picker error:", expect.any(Error));
    consoleSpy.mockRestore();
  });
});
