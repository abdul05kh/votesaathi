/**
 * Tests for VoiceoverContext
 * Covers: default state, enable/disable, context availability
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceoverProvider, useVoiceoverContext } from '@/context/VoiceoverContext';

function TestConsumer() {
  const { voiceoverEnabled, setVoiceoverEnabled } = useVoiceoverContext();
  return (
    <div>
      <span data-testid="status">{voiceoverEnabled ? 'ON' : 'OFF'}</span>
      <button onClick={() => setVoiceoverEnabled(true)} data-testid="enable">Enable</button>
      <button onClick={() => setVoiceoverEnabled(false)} data-testid="disable">Disable</button>
    </div>
  );
}

describe('VoiceoverContext', () => {
  it('defaults to voiceover OFF', () => {
    render(
      <VoiceoverProvider>
        <TestConsumer />
      </VoiceoverProvider>
    );
    expect(screen.getByTestId('status').textContent).toBe('OFF');
  });

  it('enables voiceover on setVoiceoverEnabled(true)', () => {
    render(
      <VoiceoverProvider>
        <TestConsumer />
      </VoiceoverProvider>
    );
    fireEvent.click(screen.getByTestId('enable'));
    expect(screen.getByTestId('status').textContent).toBe('ON');
  });

  it('disables voiceover on setVoiceoverEnabled(false)', () => {
    render(
      <VoiceoverProvider>
        <TestConsumer />
      </VoiceoverProvider>
    );
    fireEvent.click(screen.getByTestId('enable'));
    fireEvent.click(screen.getByTestId('disable'));
    expect(screen.getByTestId('status').textContent).toBe('OFF');
  });

  it('throws if useVoiceoverContext is used outside VoiceoverProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useVoiceoverContext must be used within VoiceoverProvider');
    spy.mockRestore();
  });

  it('provides context to deeply nested children', () => {
    function Nested() {
      const { voiceoverEnabled } = useVoiceoverContext();
      return <span data-testid="nested">{voiceoverEnabled ? 'yes' : 'no'}</span>;
    }
    render(
      <VoiceoverProvider>
        <div><div><Nested /></div></div>
      </VoiceoverProvider>
    );
    expect(screen.getByTestId('nested').textContent).toBe('no');
  });

  it('exposes speakIfEnabled and stopVoiceover functions', () => {
    function FunctionConsumer() {
      const { speakIfEnabled, stopVoiceover } = useVoiceoverContext();
      return (
        <div>
          <button data-testid="speak" onClick={() => speakIfEnabled('test', 'en-IN')}>Speak</button>
          <button data-testid="stop" onClick={() => stopVoiceover()}>Stop</button>
        </div>
      );
    }
    render(
      <VoiceoverProvider>
        <FunctionConsumer />
      </VoiceoverProvider>
    );
    // Should not throw
    fireEvent.click(screen.getByTestId('speak'));
    fireEvent.click(screen.getByTestId('stop'));
  });
});
