'use client';

import EmbedInput from "@/components/app/chatbot_basic/EmbedInput";
import ChatContext, { ChatMessage } from "@/components/app/chatbot_basic/ChatContext";
import generateUUID from "@/lib/functions/generateUUID";
import { useCallback, useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function ChatbotBasicContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o");

  const allowModel = useCallback((id: string) => {
    const blacklist = ["embedding", "whisper", "tts", "realtime", "moderation", "audio", "clip"];
    const lower = id.toLowerCase();
    return !blacklist.some(b => lower.includes(b));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/openai/models", { cache: "no-store" });
        const data = await res.json();
        const ids: string[] = (data?.models ?? []).filter(allowModel);
        if (!cancelled) {
          setModels(ids);
          if (ids.length && !ids.includes(selectedModel)) setSelectedModel(ids[0]);
        }
      } catch {
        const fallback = ["gpt-4o", "gpt-4o-mini"].filter(allowModel);
        if (!cancelled) {
          setModels(fallback);
          if (!fallback.includes(selectedModel) && fallback.length) setSelectedModel(fallback[0]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [selectedModel, allowModel]);

  const handleSubmitText = async (text: string) => {
    // 1) Show user message
    const userMessage: ChatMessage = { id: generateUUID(), role: "user", text };
    setMessages((prev) => [...prev, userMessage]);

    // 2) EmbedInput already logs user embeddings

    // 3) Get assistant, append, and embed assistant text
    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error(`Responses API error: ${res.status}`);
      const data = await res.json();
      const assistantText: string = data?.text ?? '';

      const assistantMessage: ChatMessage = { id: generateUUID(), role: 'assistant', text: assistantText };
      setMessages((prev) => [...prev, assistantMessage]);

      // Log assistant embeddings
      try {
        const embRes = await fetch('/api/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: assistantText }),
        });
        if (!embRes.ok) throw new Error(`Embeddings API error: ${embRes.status}`);
        const embData = await embRes.json();
        console.log('Assistant embedding vector length:', embData?.embedding?.length);
        console.log('Assistant embedding:', embData?.embedding);
      } catch (embedErr) {
        console.error('Assistant embedding error:', embedErr);
      }
    } catch (err) {
      console.error('Assistant response error:', err);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center w-1/2 gap-4 m-10">
        <ChatContext messages={messages} />
        <div className="w-full flex justify-center">
          <div className="w-1/2">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <EmbedInput onSubmitText={handleSubmitText} />
      </div>
    </div>
  );
}
