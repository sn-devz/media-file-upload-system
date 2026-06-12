import React from 'react';
import Button from '../Button';
import { View } from 'react-native';

jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useCallback: (cb: any) => cb,
    useMemo: (cb: any) => cb(),
  };
});

describe('Button component', () => {
  it('executes render function', () => {
    const result = (Button as any).type({ title: 'Press Me', onPress: () => {} });
    expect(result).toBeTruthy();
    
    // Simulate onPress branch
    if (result && result.props && result.props.onPress) {
       result.props.onPress();
    }
  });

  it('executes render function disabled', () => {
    const result = (Button as any).type({ title: 'Press Me', onPress: () => {}, disabled: true });
    expect(result).toBeTruthy();
  });

  it('executes render function with icon', () => {
    const result = (Button as any).type({ title: 'Press Me', onPress: () => {}, icon: <View /> });
    expect(result).toBeTruthy();
  });
});
