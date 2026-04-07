import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxChat } from '../src/components/TkxChat';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';
import type { ChatMessage } from '../src/components/TkxChat';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const sampleMessages: ChatMessage[] = [
  { id: '1', role: 'user', content: 'Hello there' },
  { id: '2', role: 'assistant', content: 'Hi! How can I help?' },
];

describe('TkxChat', () => {
  it('renders chat messages', () => {
    render(<TkxChat messages={sampleMessages} />, { wrapper: Wrapper });
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(screen.getByText('Hi! How can I help?')).toBeInTheDocument();
  });

  it('renders user role messages', () => {
    const msgs: ChatMessage[] = [{ id: '1', role: 'user', content: 'User message' }];
    render(<TkxChat messages={msgs} />, { wrapper: Wrapper });
    expect(screen.getByText('User message')).toBeInTheDocument();
  });

  it('renders assistant role messages', () => {
    const msgs: ChatMessage[] = [{ id: '1', role: 'assistant', content: 'Bot reply' }];
    render(<TkxChat messages={msgs} />, { wrapper: Wrapper });
    expect(screen.getByText('Bot reply')).toBeInTheDocument();
  });

  it('renders system role messages', () => {
    const msgs: ChatMessage[] = [{ id: '1', role: 'system', content: 'System notice' }];
    render(<TkxChat messages={msgs} />, { wrapper: Wrapper });
    expect(screen.getByText('System notice')).toBeInTheDocument();
  });

  it('renders placeholder text in input', () => {
    render(<TkxChat messages={[]} placeholder="Type a message..." />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });
});
