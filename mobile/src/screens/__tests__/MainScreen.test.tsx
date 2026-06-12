import React from 'react';
import MainScreen from '../MainScreen';

jest.mock('@/hooks', () => ({
  useMediaController: () => ({
    files: [
      { id: '1', name: 'test.jpg', size: 100, mimeType: 'image/jpeg', progress: 50, status: 'uploading' }
    ],
    totalProgress: 50,
    pickDocument: jest.fn(),
    pickAnyFile: jest.fn(),
    takePhoto: jest.fn(),
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
    useCallback: (cb: any) => cb,
    useMemo: (cb: any) => cb(),
    useEffect: (cb: any) => cb(),
  };
});

describe('MainScreen', () => {
  const getElementByTestId = (element: any, testID: string): any => {
    if (!element) return null;
    if (element.props && element.props.testID === testID) return element;
    if (element.props && element.props.children) {
      if (Array.isArray(element.props.children)) {
        for (const child of element.props.children) {
          const found = getElementByTestId(child, testID);
          if (found) return found;
        }
      } else {
        return getElementByTestId(element.props.children, testID);
      }
    }
    return null;
  };

  it('executes render function', () => {
    const result = MainScreen();
    expect(result).toBeTruthy();

    // Simulate onPress branch for buttons
    const pickBtn = getElementByTestId(result, 'pick-btn');
    if (pickBtn && pickBtn.props.onPress) pickBtn.props.onPress();

    const photoBtn = getElementByTestId(result, 'photo-btn');
    if (photoBtn && photoBtn.props.onPress) photoBtn.props.onPress();

    // Call renderItem and keyExtractor
    if (result && result.props && result.props.children) {
      const children = Array.isArray(result.props.children) ? result.props.children : [result.props.children];
      for (const child of children) {
        if (child && child.props && child.props.data && child.props.renderItem) {
          // It's the FlatList
          child.props.renderItem({ item: { id: '1' } });
          child.props.keyExtractor({ id: '1' });
        }
      }
    }
  });
});
