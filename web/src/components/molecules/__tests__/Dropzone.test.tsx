import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import Dropzone from '../Dropzone';

describe('Dropzone', () => {
  it('renders default state correctly', () => {
    render(<Dropzone onFilesAdded={jest.fn()} />);
    expect(screen.getByText(/Drag & Drop Media Files/i)).toBeInTheDocument();
    expect(screen.getByText(/or click to select files/i)).toBeInTheDocument();
  });

});
