import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ActionButton from '../ActionButton';
import { Play } from 'lucide-react';

describe('ActionButton', () => {
  it('renders correctly with an icon', () => {
    render(<ActionButton icon={<Play data-testid="play-icon" />} onClick={jest.fn()} aria-label="Play" />);
    expect(screen.getByTestId('play-icon')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<ActionButton icon={<Play />} onClick={handleClick} aria-label="Play" />);
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<ActionButton icon={<Play />} onClick={handleClick} disabled aria-label="Play" />);
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /play/i })).toBeDisabled();
  });

  it('applies danger styling when danger is true', () => {
    render(<ActionButton icon={<Play />} onClick={jest.fn()} danger aria-label="Play" />);
    const button = screen.getByRole('button', { name: /play/i });
    expect(button.className).toContain('ant-btn-dangerous');
  });
});
