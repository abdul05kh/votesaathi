import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from '@/components/ChatInterface';
import { generateStreamingResponse } from '@/lib/gemini';
import '@testing-library/jest-dom';

// Mock the gemini lib
jest.mock('@/lib/gemini', () => ({
  generateStreamingResponse: jest.fn(),
}));

// Mock trackEvent
jest.mock('@/lib/firebase', () => ({
  trackEvent: jest.fn(),
  saveChatSession: jest.fn(),
}));

// Mock context
jest.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    speechVoiceCode: 'en-IN',
  }),
}));

describe('ChatInterface', () => {
  it('renders chat interface and allows sending messages', async () => {
    const mockGenerator = async function* () {
      yield 'Hello ';
      yield 'Voter!';
    };
    (generateStreamingResponse as jest.Mock).mockReturnValue(mockGenerator());

    render(<ChatInterface />);

    const input = screen.getByPlaceholderText(/Ask VoteSaathi/i);
    const sendButton = screen.getByRole('button', { name: /Send/i });

    fireEvent.change(input, { target: { value: 'Hi' } });
    fireEvent.click(sendButton);

    // Check if user message appears
    expect(screen.getByText('Hi')).toBeInTheDocument();

    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText('Hello Voter!')).toBeInTheDocument();
    });
  });

  it('has correct accessibility attributes', () => {
    render(<ChatInterface />);
    // Check for aria-live region
    const liveRegion = screen.getByTestId('ai-announcement');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    
    // Check if input has aria-label
    const input = screen.getByPlaceholderText(/Ask VoteSaathi/i);
    expect(input).toHaveAttribute('aria-label', 'Voter query input');
  });
});
