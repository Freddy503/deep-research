'use client';

import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = 'Ask anything...',
}: SearchInputProps) {
  return (
    <form onSubmit={onSubmit} className="relative">
      <div className="relative flex items-center">
        <Input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full h-14 pr-14 text-base rounded-xl border-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-lg"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !value.trim()}
          className="absolute right-2 h-10 w-10 rounded-lg"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowRight className="h-5 w-5" />
          )}
        </Button>
      </div>
    </form>
  );
}
