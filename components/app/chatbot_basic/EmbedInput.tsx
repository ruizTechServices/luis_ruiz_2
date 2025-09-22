'use client';

import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface EmbedInputProps {
  onSubmitText?: (text: string) => void;
  disabled?: boolean;
  loading?: boolean; // show spinner when server is processing/streaming
}

export default function EmbedInput({ onSubmitText, disabled, loading }: EmbedInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isDisabled = !!disabled || !!loading;

  const submit = () => {
    if (isDisabled) return;
    if (inputRef.current) {
      const value = inputRef.current.value.trim();
      if (value) {
        onSubmitText?.(value);
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-row items-center w-full">
      <Input
        ref={inputRef}
        placeholder="Input Query..."
        disabled={isDisabled}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isDisabled) {
            submit();
          }
        }}
      />
      <Button onClick={submit} disabled={isDisabled}>Submit</Button>
      {loading && (
        <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" aria-label="Submitting..." />
      )}
    </div>
  );
}
