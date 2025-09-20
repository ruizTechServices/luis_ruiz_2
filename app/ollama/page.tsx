'use client'

import React, { useEffect, useRef, useState } from 'react'

// Minimal chat UI for local Ollama via Next.js API routes
export default function OllamaChatPage() {
  const [models, setModels] = useState<string[]>([])
  const [model, setModel] = useState<string>('')
  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const assistantBufferRef = useRef('')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/ollama/models', { cache: 'no-store' })
        const json = (await res.json()) as { models?: string[] }
        const list = Array.isArray(json.models) ? json.models : []
        if (!active) return
        setModels(list)
        // Prefer a small local model if present, else first
        const preferred = list.find(m => /llama3\.2:1b|phi3:mini|gemma3:1b/i.test(m)) || list[0] || ''
        setModel(preferred)
      } catch (e) {
        if (!active) return
        setModels([])
        setModel('')
      }
    })()
    return () => {
      active = false
    }
  }, [])

  async function handleSend() {
    setError(null)
    const prompt = input.trim()
    if (!prompt) return
    if (!model) {
      setError('No model selected.')
      return
    }

    // Append the user message
    const nextMessages = [...messages, { role: 'user' as const, content: prompt }]
    setMessages(nextMessages)
    setInput('')

    // Prepare to stream assistant reply
    setStreaming(true)
    assistantBufferRef.current = ''
    controllerRef.current = new AbortController()

    try {
      const res = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          temperature: 0.6,
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
        }),
        signal: controllerRef.current.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error(`Request failed (${res.status})`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: d } = await reader.read()
        done = d
        if (value) {
          const chunk = decoder.decode(value)
          assistantBufferRef.current += chunk
          setMessages(curr => {
            const last = curr[curr.length - 1]
            if (last && last.role === 'assistant') {
              // Update in place
              return [...curr.slice(0, -1), { ...last, content: assistantBufferRef.current }]
            } else {
              // Start new assistant message
              return [...curr, { role: 'assistant' as const, content: assistantBufferRef.current }]
            }
          })
        }
      }
    } catch (e: unknown) {
      if ((e as any)?.name !== 'AbortError') {
        const msg = e instanceof Error ? e.message : 'Stream failed'
        setError(msg)
      }
    } finally {
      setStreaming(false)
      controllerRef.current = null
    }
  }

  function handleStop() {
    controllerRef.current?.abort()
  }

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Local Ollama Chat</h1>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-500">Model</label>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={model}
          onChange={e => setModel(e.target.value)}
        >
          {models.length === 0 && <option value="">No local models found</option>}
          {models.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        {streaming ? (
          <button onClick={handleStop} className="ml-auto px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700">
            Stop
          </button>
        ) : null}
      </div>

      <div className="border rounded p-3 h-80 overflow-y-auto bg-white/40">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">Ask anything to your local model.</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m, i) => (
              <li key={i} className="whitespace-pre-wrap">
                <span className={m.role === 'user' ? 'font-medium text-blue-700' : 'font-medium text-green-700'}>
                  {m.role === 'user' ? 'You' : 'Assistant'}:
                </span>{' '}
                <span>{m.content}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <div className="flex gap-2">
        <textarea
          className="flex-1 border rounded p-2 min-h-12"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (!streaming) handleSend()
            }
          }}
        />
        <button
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          onClick={handleSend}
          disabled={streaming || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}
