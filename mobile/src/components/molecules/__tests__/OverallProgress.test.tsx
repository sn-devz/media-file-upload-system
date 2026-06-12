import React from 'react';
import OverallProgress from '../OverallProgress';

describe('OverallProgress component', () => {
  it('executes render function at 0', () => {
    const result = (OverallProgress as any).type({ progress: 0 });
    expect(result).toBeTruthy();
  });
  
  it('executes render function at 50', () => {
    const result = (OverallProgress as any).type({ progress: 55.5 });
    expect(result).toBeTruthy();
  });
});
