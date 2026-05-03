import { consultLawyer, generateStreamingResponse } from '@/lib/gemini';
import { getGenerativeModel } from 'firebase/ai';

// Mock Firebase AI Logic
jest.mock('firebase/ai', () => ({
  getGenerativeModel: jest.fn().mockReturnValue({
    generateContent: jest.fn(),
    generateContentStream: jest.fn(),
  }),
}));

jest.mock('@/lib/firebase', () => ({
  aiService: {},
  trackEvent: jest.fn(),
  saveChatSession: jest.fn(),
}));

describe('Gemini Library', () => {
  const mockModel = (getGenerativeModel as jest.Mock)();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('consultLawyer should return AI response', async () => {
    mockModel.generateContent.mockResolvedValue({
      response: { text: () => 'Legal Advice' },
    });

    const result = await consultLawyer('How to vote?');
    expect(result).toBe('Legal Advice');
    expect(mockModel.generateContent).toHaveBeenCalled();
  });

  it('generateStreamingResponse should yield chunks', async () => {
    const mockStream = (async function* () {
      yield { text: () => 'Chunk 1 ' };
      yield { text: () => 'Chunk 2' };
    })();

    mockModel.generateContentStream.mockResolvedValue({
      stream: mockStream,
    });

    const generator = generateStreamingResponse('Hello');
    const results = [];
    for await (const chunk of generator) {
      results.push(chunk);
    }

    expect(results).toEqual(['Chunk 1 ', 'Chunk 2']);
  });
});
