'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Loader2, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SourcesCard } from '@/components/sources-card';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string; snippet?: string }>;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-4 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
          )}

          <div className={`max-w-[85%] ${message.role === 'user' ? '' : 'flex-1'}`}>
            <Card
              className={`${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card'
              }`}
            >
              <CardContent className="p-4">
                {message.role === 'user' ? (
                  <p className="text-sm">{message.content}</p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{message.content || ' '}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>

            {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
              <SourcesCard sources={message.sources} />
            )}
          </div>

          {message.role === 'user' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-5 w-5 text-secondary-foreground" />
            </div>
          )}
        </div>
      ))}

      {isLoading && messages.length > 0 && (
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Researching...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
