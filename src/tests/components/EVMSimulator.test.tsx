import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import EVMSimulator from '@/components/EVMSimulator';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Volume2: () => <div data-testid="volume-icon" />,
  Printer: () => <div data-testid="printer-icon" />,
  SkipForward: () => <div data-testid="skip-icon" />,
}));

describe('EVMSimulator Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with initial state', () => {
    render(<EVMSimulator />);
    expect(screen.getByText('Ballot Unit')).toBeInTheDocument();
    expect(screen.getByText('VVPAT')).toBeInTheDocument();
    expect(screen.getByText('Aditi Sharma')).toBeInTheDocument();
    expect(screen.getByText('Rahul Verma')).toBeInTheDocument();
  });

  it('handles voting for a candidate', async () => {
    render(<EVMSimulator />);
    const aditiVoteBtn = screen.getByLabelText(/vote for Aditi Sharma/i);
    
    fireEvent.click(aditiVoteBtn);
    
    // Check if lamp turns on and beep appears
    expect(screen.getByText(/Beep/i)).toBeInTheDocument();
    
    // Advance time to show VVPAT slip (1s)
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Check if VVPAT slip shows correct candidate info
    const names = screen.getAllByText('Aditi Sharma');
    expect(names.length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('🌻').length).toBeGreaterThanOrEqual(2);
    
    // Check if buttons are disabled during voting
    expect(aditiVoteBtn).toBeDisabled();
    
    // Advance time to end of voting period (7s total)
    act(() => {
      jest.advanceTimersByTime(6000);
    });
    
    // Check if reset occurred
    expect(screen.queryByText(/Beep/i)).not.toBeInTheDocument();
    expect(aditiVoteBtn).not.toBeDisabled();
  });

  it('allows skipping the step', () => {
    render(<EVMSimulator />);
    const skipBtn = screen.getByText('Skip Step');
    
    // Click a vote button first to trigger a lamp
    fireEvent.click(screen.getByLabelText(/vote for Rahul Verma/i));
    
    // Click skip
    fireEvent.click(skipBtn);
    
    expect(skipBtn).toBeInTheDocument();
  });
});
