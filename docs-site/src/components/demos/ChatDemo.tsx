import { useState } from 'react';
import { TkxChat } from 'tekivex-ui';
import { Preview } from '../Preview';

interface Msg { id: string; role: 'user' | 'assistant' | 'system'; content: string; timestamp?: Date; }

export function ChatBasic() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: '1', role: 'system',    content: 'You are a helpful assistant.' },
    { id: '2', role: 'user',      content: 'What is TekiVex UI?',                                                           timestamp: new Date() },
    { id: '3', role: 'assistant', content: 'A production-grade React component library with 116 components, WCAG 2.1 AAA, and a published security threat model.', timestamp: new Date() },
  ]);
  return (
    <Preview label="LLM-style chat — type below to send" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ width: '100%', maxWidth: 560, height: 320 }}>
        <TkxChat
          messages={msgs}
          onSend={(content) => {
            setMsgs((prev) => [
              ...prev,
              { id: String(prev.length + 1), role: 'user', content, timestamp: new Date() },
              { id: String(prev.length + 2), role: 'assistant', content: `Echo: "${content}". This is a demo with no real LLM behind it.`, timestamp: new Date() },
            ]);
          }}
        />
      </div>
    </Preview>
  );
}
