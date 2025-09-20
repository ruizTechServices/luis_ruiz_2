'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import EmbedInput from '@/components/app/chatbot_basic/EmbedInput'

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
  const [temperature, setTemperature] = useState<number>(0.6)
  const [topP, setTopP] = useState<number>(0.9)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/ollama/models', { cache: 'no-store' })
        const json = (await res.json()) as { models?: string[] }
        const list = Array.isArray(json.models) ? json.models : []
        if (!active) return
        setModels(list)
        let preferred = list.find(m => /llama3\.2:1b|phi3:mini|gemma3:1b/i.test(m)) || list[0] || ''
        try {
          const raw = localStorage.getItem('ollama_settings')
          if (raw) {
            const s = JSON.parse(raw)
            if (s && typeof s.model === 'string' && list.includes(s.model)) preferred = s.model
            if (typeof s.temperature === 'number') setTemperature(s.temperature)
            if (typeof s.topP === 'number') setTopP(s.topP)
          }
        } catch {}
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

  // Persist settings (model, temperature, topP)
  useEffect(() => {
    try {
      localStorage.setItem('ollama_settings', JSON.stringify({ model, temperature, topP }))
    } catch {}
  }, [model, temperature, topP])

  // Load messages for the current model on change
  useEffect(() => {
    if (!model) return
    try {
      const raw = localStorage.getItem(`ollama_chat_${model}`)
      setMessages(raw ? (JSON.parse(raw) as Array<{ role: 'user' | 'assistant'; content: string }>) : [])
    } catch {
      setMessages([])
    }
  }, [model])

  // Persist messages per model
  useEffect(() => {
    if (!model) return
    try {
      localStorage.setItem(`ollama_chat_${model}`, JSON.stringify(messages))
    } catch {}
  }, [messages, model])

  async function sendPrompt(prompt: string) {
    setError(null)
    const p = prompt.trim()
    if (!p) return
    if (!model) {
      setError('No model selected.')
      return
    }

    // Append the user message
    const nextMessages = [...messages, { role: 'user' as const, content: p }]
    setMessages(nextMessages)

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
          temperature,
          top_p: topP,
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

  async function handleSend() {
    const prompt = input.trim()
    if (!prompt) return
    setInput('')
    sendPrompt(prompt)
  }

  function handleStop() {
    controllerRef.current?.abort()
  }

  function handleClear() {
    if (streaming) controllerRef.current?.abort()
    setMessages([])
    try { if (model) localStorage.removeItem(`ollama_chat_${model}`) } catch {}
  }

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Local Ollama Chat</h1>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger size="sm" className="min-w-[14rem]">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.length === 0 ? (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">No local models found</div>
              ) : (
                models.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="temp" className="text-sm text-muted-foreground">Temperature</Label>
            <div className="w-40">
              <Slider id="temp" value={[temperature]} onValueChange={(v) => setTemperature(v[0] ?? 0.6)} min={0} max={1} step={0.01} />
            </div>
            <span className="text-xs text-muted-foreground w-10 text-right">{temperature.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="topp" className="text-sm text-muted-foreground">top_p</Label>
            <div className="w-40">
              <Slider id="topp" value={[topP]} onValueChange={(v) => setTopP(v[0] ?? 0.9)} min={0} max={1} step={0.01} />
            </div>
            <span className="text-xs text-muted-foreground w-10 text-right">{topP.toFixed(2)}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {streaming && (
            <Button variant="destructive" size="sm" onClick={handleStop}>Stop</Button>
          )}
          <Button variant="secondary" size="sm" onClick={handleClear}>Clear chat</Button>
        </div>
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

      {/* Combined input: computes embeddings (logs to console) AND triggers chat */}
      <div className="flex gap-2">
        <EmbedInput onSubmitText={(text) => { sendPrompt(text) }} />
      </div>

      
    </div>
  )
}
