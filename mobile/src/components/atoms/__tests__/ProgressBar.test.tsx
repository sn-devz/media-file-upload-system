import React from 'react';
import ProgressBar from '../ProgressBar';

describe('ProgressBar component', () => {
  it('executes render function at 0', () => {
    const result = (ProgressBar as any).type({ progress: 0 });
    expect(result).toBeTruthy();
  });
  
  it('executes render function at 50', () => {
    const result = (ProgressBar as any).type({ progress: 50 });
    expect(result).toBeTruthy();
  });

  it('executes render function at 100', () => {
    const result = (ProgressBar as any).type({ progress: 100 });
    expect(result).toBeTruthy();
  });
});
