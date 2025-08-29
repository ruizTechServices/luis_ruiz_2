'use client';

import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EmbedInputProps {
  onSubmitText?: (text: string) => void;
}

export default function EmbedInput({ onSubmitText }: EmbedInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEmbedding = async (text: string) => {
    try {
      const res = await fetch('/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        throw new Error(`Embeddings API error: ${res.status}`);
      }
      const data = await res.json();
      console.log('Embedding vector length:', data?.embedding?.length);
      console.log('Embedding:', data?.embedding);
    } catch (err) {
      console.error('Embedding error:', err);
    }
  };

  const submitEmbedding = () => {
    if (inputRef.current) {
      const value = inputRef.current.value.trim();
      if (value) {
        // Call server to compute embedding and log to console
        handleEmbedding(value);
        // Bubble up the text so ChatContext (stateless) can display it via the container
        onSubmitText?.(value);
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-row items-center w-1/2">
      <Input
        ref={inputRef}
        placeholder="Input Query..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            submitEmbedding();
          }
        }}
      />
      <Button onClick={submitEmbedding}>Submit</Button>
    </div>
  );
}
