import '@testing-library/jest-dom';
import React from 'react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Silence framer-motion in tests — use React.createElement to avoid JSX transform issues in .ts
jest.mock('framer-motion', () => {
  const passthrough = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);
  return {
    motion: {
      div: passthrough,
      span: passthrough,
      section: passthrough,
      button: passthrough,
      h1: passthrough,
      p: passthrough,
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useAnimation: () => ({}),
    useInView: () => true,
  };
});

// Mock speechSynthesis
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: jest.fn(),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    getVoices: jest.fn(() => []),
    speaking: false,
    pending: false,
    paused: false,
  },
  writable: true,
});

// Mock navigator.mediaDevices
if (typeof window !== 'undefined') {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: jest.fn().mockResolvedValue({
        getTracks: () => [{ stop: jest.fn() }],
      }),
    },
    writable: true,
  });
}

// Mock SpeechSynthesisUtterance
(global as unknown as Record<string, unknown>).SpeechSynthesisUtterance = jest.fn().mockImplementation(() => ({
  text: '',
  lang: 'en-IN',
  rate: 1,
  pitch: 1,
  onend: null,
  onerror: null,
}));

// Mock react-markdown
jest.mock('react-markdown', () => {
  return ({ children }: { children: string }) => React.createElement('div', null, children);
});

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();
