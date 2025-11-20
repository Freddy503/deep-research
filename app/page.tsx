'use client';

import { useState, useRef } from 'react';
import { SearchInput } from '@/components/search-input';
import { MessageList } from '@/components/message-list';
import { Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string; snippet?: string }>;
}

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const query = input.trim();
    setInput('');
    setHasStarted(true);
    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Create assistant message
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'text') {
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === 'assistant') {
                    lastMessage.content += parsed.content;
                  }
                  return newMessages;
                });
              } else if (parsed.type === 'sources') {
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === 'assistant') {
                    lastMessage.sources = parsed.content;
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error:', error);
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.content = 'Sorry, an error occurred while researching. Please try again.';
          }
          return newMessages;
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Header */}
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-md bg-primary" />
            <span className="font-semibold text-lg">Deep Research</span>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full max-w-4xl px-4 py-8">
        {!hasStarted ? (
          /* Center search when no messages */
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                What do you want to research?
              </h1>
              <p className="text-muted-foreground">
                Ask anything and get comprehensive research with sources
              </p>
            </div>
            <div className="w-full max-w-2xl">
              <SearchInput
                value={input}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                placeholder="Ask anything..."
              />
            </div>
          </div>
        ) : (
          /* Show messages and fixed search at bottom */
          <div className="flex flex-col h-[calc(100vh-120px)]">
            <div className="flex-1 overflow-y-auto mb-4">
              <MessageList messages={messages} isLoading={isLoading} />
            </div>
            <div className="sticky bottom-0 bg-background pt-4 border-t">
              <SearchInput
                value={input}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                placeholder="Ask a follow-up question..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && !messages.length && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Researching...</p>
          </div>
        </div>
      )}
    </main>
  );
}
