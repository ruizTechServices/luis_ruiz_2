'use client';

import React from "react";

export type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

interface ChatContextProps {
  messages: ChatMessage[];
}

export default function ChatContext({ messages }: ChatContextProps) {

  return (
    <div className="w-full max-w-2xl min-h-[10rem] border rounded-lg p-4 bg-background overflow-y-auto">
      <div className="flex flex-col gap-2">
        {messages?.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-md ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
