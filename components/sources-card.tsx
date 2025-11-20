'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface Source {
  title: string;
  url: string;
  snippet?: string;
}

interface SourcesCardProps {
  sources: Source[];
}

export function SourcesCard({ sources }: SourcesCardProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-primary" />
          Sources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {sources.slice(0, 5).map((source, index) => (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 p-3 rounded-lg border hover:bg-accent transition-colors group"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                    {source.title}
                  </p>
                  <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                {source.snippet && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {source.snippet}
                  </p>
                )}
                <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-1">
                  {new URL(source.url).hostname}
                </p>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
