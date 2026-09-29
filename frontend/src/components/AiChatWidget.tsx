import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { AiMessage, sendChatMessage } from '../api/aiApi';

interface ChatEntry extends AiMessage {
  id: number;
}

const AiChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending, isOpen]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || isSending) return;

    const history: AiMessage[] = messages.slice(-8).map(({ role, content: text }) => ({ role, content: text }));
    setMessages(previous => [...previous, { id: Date.now(), role: 'user', content }]);
    setInput('');
    setError('');
    setIsSending(true);

    try {
      const reply = await sendChatMessage(content, history);
      setMessages(previous => [...previous, { id: Date.now() + 1, role: 'assistant', content: reply }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not reach the AI assistant.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`ai-chat ${isOpen ? 'is-open' : ''}`}>
      {isOpen ? (
        <section className="ai-chat-panel" aria-label="AI chat assistant">
          <header className="ai-chat-header">
            <div>
              <span className="ai-chat-kicker">BLOG ASSISTANT</span>
              <h2 className="ai-chat-title">Ask anything</h2>
            </div>
            <button className="ai-chat-close" type="button" aria-label="Close chat" onClick={() => setIsOpen(false)}>×</button>
          </header>
          <div className="ai-chat-messages" aria-live="polite">
            {messages.length === 0 && (
              <p className="ai-chat-welcome">Ask about published posts or explore a topic.</p>
            )}
            {messages.map(message => (
              <div key={message.id} className={`chat-bubble chat-${message.role}`}>
                {message.content}
              </div>
            ))}
            {isSending && <div className="chat-bubble chat-assistant chat-thinking">Thinking…</div>}
            {error && <p className="ai-error chat-error" role="alert">{error}</p>}
            <div ref={messageEndRef} />
          </div>
          <form className="ai-chat-form" onSubmit={handleSubmit}>
            <input
              className="field-control ai-chat-input"
              aria-label="Message the assistant"
              placeholder="Write a message…"
              value={input}
              onChange={event => setInput(event.target.value)}
              maxLength={2000}
              disabled={isSending}
            />
            <button className="chat-send" type="submit" aria-label="Send message" disabled={isSending || !input.trim()}>
              ↑
            </button>
          </form>
        </section>
      ) : (
        <button className="ai-chat-launcher" type="button" onClick={() => setIsOpen(true)}>
          <span className="ai-mark" aria-hidden="true">AI</span>
          Ask assistant
        </button>
      )}
    </div>
  );
};

export default AiChatWidget;