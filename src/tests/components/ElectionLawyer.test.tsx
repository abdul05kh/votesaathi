import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ElectionLawyer from '@/components/ElectionLawyer';

// Mock context and hooks
jest.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    speechVoiceCode: 'en-IN',
  }),
}));

jest.mock('@/hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => ({
    isListening: false,
    startListening: jest.fn(),
    stopListening: jest.fn(),
  }),
}));

// Mock window.speechSynthesis
const mockSpeak = jest.fn();
const mockCancel = jest.fn();
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      speak: mockSpeak,
      cancel: mockCancel,
      getVoices: () => [],
    },
    writable: true,
  });
}

// Mock react-markdown as it's ESM only and causes issues in Jest
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

// Mock gemini lib
jest.mock('@/lib/gemini', () => ({
  consultLawyer: jest.fn(),
}));

describe('ElectionLawyer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { consultLawyer } = require('@/lib/gemini');
    (consultLawyer as jest.Mock).mockResolvedValue('The RPA 1951 states that...');
  });

  it('renders correctly with welcome message', () => {
    render(<ElectionLawyer />);
    expect(screen.getByText(/Welcome to SanshayNivaran/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask about your voting rights/i)).toBeInTheDocument();
  });

  it('handles user input and submits message', async () => {
    render(<ElectionLawyer />);
    const input = screen.getByPlaceholderText(/Ask about your voting rights/i);
    const form = screen.getByRole('textbox').closest('form')!;
    
    fireEvent.change(input, { target: { value: 'What is Section 8?' } });
    fireEvent.submit(form);

    expect(screen.getByText('What is Section 8?')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/The RPA 1951 states that/i)).toBeInTheDocument();
    });
    
    const { consultLawyer } = require('@/lib/gemini');
    expect(consultLawyer).toHaveBeenCalledWith('What is Section 8?', 'en');
  });

  it('triggers voice replay when clicking listen button', async () => {
    render(<ElectionLawyer />);
    
    // Wait for initial assistant message and click replay
    const listenBtn = screen.getByText(/Listen to Advice/i);
    fireEvent.click(listenBtn);
    
    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    const { consultLawyer } = require('@/lib/gemini');
    (consultLawyer as jest.Mock).mockRejectedValue(new Error('API Failure'));
    
    render(<ElectionLawyer />);
    const input = screen.getByPlaceholderText(/Ask about your voting rights/i);
    const form = screen.getByRole('textbox').closest('form')!;
    
    fireEvent.change(input, { target: { value: 'Test Error' } });
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/An error occurred while consulting the legal database/i)).toBeInTheDocument();
    });
  });
});
