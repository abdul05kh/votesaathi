import { render, screen, fireEvent, act } from '@testing-library/react';
import ArEvm from '@/components/ArEvm';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Camera: () => <div data-testid="camera-icon" />,
  XCircle: () => <div data-testid="x-icon" />,
  CheckCircle2: () => <div data-testid="check-icon" />,
}));

// Mock MediaDevices
const mockStream = {
  getTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }]),
};

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue(mockStream),
  },
  writable: true,
});

// Mock Audio
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(undefined),
})) as any;

describe('ArEvm Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders initial state with call to action', () => {
    render(<ArEvm />);
    expect(screen.getByText(/Summon Holographic EVM/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Grant camera access/i })).toBeInTheDocument();
  });

  it('activates AR mode when permission is granted', async () => {
    render(<ArEvm />);
    const startButton = screen.getByRole('button', { name: /Grant camera access/i });
    
    await act(async () => {
      fireEvent.click(startButton);
    });

    expect(screen.getByText(/AR TRACKING ACTIVE/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Close AR experience/i)).toBeInTheDocument();
  });

  it('simulates voting process and shows VVPAT slip', async () => {
    render(<ArEvm />);
    
    // Start AR
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Grant camera access/i }));
    });

    // Find first candidate button (Candidate A)
    const voteButton = screen.getByLabelText(/Vote for Candidate A/i);
    
    await act(async () => {
      fireEvent.click(voteButton);
    });

    // Check if VVPAT slip is shown
    expect(screen.getByText(/VVPAT Slip/i)).toBeInTheDocument();
    // Candidate A appears in both the list and the VVPAT slip
    expect(screen.getAllByText(/Candidate A/i).length).toBe(2);

    // Fast-forward 7 seconds
    act(() => {
      jest.advanceTimersByTime(7000);
    });

    // VVPAT should disappear (it uses AnimatePresence, so we check if it's eventually gone)
    expect(screen.queryByText(/VVPAT Slip/i)).not.toBeInTheDocument();
  });

  it('stops camera and exits AR when close button is clicked', async () => {
    render(<ArEvm />);
    
    // Start AR
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Grant camera access/i }));
    });

    const closeButton = screen.getByLabelText(/Close AR experience/i);
    
    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(screen.queryByText(/AR TRACKING ACTIVE/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Summon Holographic EVM/i)).toBeInTheDocument();
  });
});
