'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Input as NumberInput } from '@/components/ui/input'
import EmbedInput from '@/components/app/chatbot_basic/EmbedInput'
import { Toaster, toast } from 'sonner'
import { checkOllamaOnline } from '@/lib/functions/isOllama'

// Minimal chat UI for local Ollama via Next.js API routes
export default function OllamaChatPage() {
  const [models, setModels] = useState<string[]>([])
  const [model, setModel] = useState<string>('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const assistantBufferRef = useRef('')
  const [temperature, setTemperature] = useState<number>(0.6)
  const [topP, setTopP] = useState<number>(0.9)
  const [chatId, setChatId] = useState<number | null>(null)
  const [useContext, setUseContext] = useState<boolean>(false)
  const [topK, setTopK] = useState<number>(5)
  const [minSim, setMinSim] = useState<number>(0.75)
  const [dbPersist, setDbPersist] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [checkingOnline, setCheckingOnline] = useState<boolean>(false)

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
      } catch {
        if (!active) return
        setModels([])
        setModel('')
      }
    })()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const h = await checkOllamaOnline(1500)
        if (!active) return
        setIsOnline(Boolean(h.online))
        if (!h.online) setError('Ollama server is not running.')
      } catch {}
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

  // Load chatId for the current model on change
  useEffect(() => {
    if (!model) return
    try {
      const raw = localStorage.getItem(`ollama_chatId_${model}`)
      const parsed = raw ? Number(raw) : null
      setChatId(Number.isFinite(parsed as number) ? parsed : null)
    } catch {
      setChatId(null)
    }
  }, [model])

  // Load context settings for the current model
  useEffect(() => {
    if (!model) return
    try {
      const raw = localStorage.getItem(`ollama_ctx_${model}`)
      if (raw) {
        const s = JSON.parse(raw)
        if (typeof s.useContext === 'boolean') setUseContext(s.useContext)
        if (typeof s.topK === 'number') setTopK(s.topK)
        if (typeof s.minSim === 'number') setMinSim(s.minSim)
      }
    } catch {}
  }, [model])

  // Persist messages per model
  useEffect(() => {
    if (!model) return
    try {
      localStorage.setItem(`ollama_chat_${model}`, JSON.stringify(messages))
    } catch {}
  }, [messages, model])

  // Persist context settings per model
  useEffect(() => {
    if (!model) return
    try {
      localStorage.setItem(`ollama_ctx_${model}`, JSON.stringify({ useContext, topK, minSim }))
    } catch {}
  }, [useContext, topK, minSim, model])

  async function sendPrompt(prompt: string) {
    setError(null)
    if (!isOnline) {
      setError('Ollama server is not running.')
      return
    }
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
          chat_id: chatId,
          with_context: useContext,
          top_k: topK,
          min_similarity: minSim,
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
        }),
        signal: controllerRef.current.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error(`Request failed (${res.status})`)
      }

      // Capture/remember chat session id from server
      const hdr = res.headers.get('x-chat-id')
      if (hdr) {
        const id = Number(hdr)
        if (!Number.isNaN(id)) {
          setChatId(id)
          try { localStorage.setItem(`ollama_chatId_${model}`, String(id)) } catch {}
        }
      }

      // Read debug headers and toast when DB persistence is on
      const persistHdr = res.headers.get('x-db-persist')
      if (persistHdr) setDbPersist(persistHdr)
      if (persistHdr === 'on') {
        if (hdr) {
          toast.success(`Saved to Supabase • Session ${hdr}`)
        } else {
          toast.success('Saved to Supabase')
        }
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
      const isAbort = (
        typeof e === 'object' &&
        e !== null &&
        'name' in e &&
        (e as { name?: unknown }).name === 'AbortError'
      );
      if (!isAbort) {
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

  function handleClear() {
    if (streaming) controllerRef.current?.abort()
    setMessages([])
    try { if (model) localStorage.removeItem(`ollama_chat_${model}`) } catch {}
    try { if (model) localStorage.removeItem(`ollama_chatId_${model}`) } catch {}
    setChatId(null)
  }

  async function handleRetry() {
    setCheckingOnline(true)
    try {
      const h = await checkOllamaOnline(1500)
      setIsOnline(Boolean(h.online))
      if (h.online) {
        try {
          const res = await fetch('/api/ollama/models', { cache: 'no-store' })
          const json = (await res.json()) as { models?: string[] }
          const list = Array.isArray(json.models) ? json.models : []
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
          setError(null)
        } catch {}
      } else {
        setError('Ollama server is not running.')
      }
    } finally {
      setCheckingOnline(false)
    }
  }

  return (
    <>
    <Toaster richColors position="top-right" />
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Local Ollama Chat</h1>

      {!isOnline && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 flex items-center justify-between gap-2">
          <div>
            Ollama is not running. Please install and start Ollama to use this chatbot.{' '}
            <a href="https://ollama.com/download" className="underline" target="_blank" rel="noreferrer">Download Ollama</a>
          </div>
          <Button size="sm" variant="secondary" onClick={handleRetry} disabled={checkingOnline}>
            {checkingOnline ? 'Checking…' : 'Retry'}
          </Button>
        </div>
      )}

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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">Use context</Label>
            <Switch checked={useContext} onCheckedChange={setUseContext} />
          </div>
          {useContext && (
            <>
              <div className="flex items-center gap-2">
                <Label htmlFor="minsim" className="text-sm text-muted-foreground">Min sim</Label>
                <div className="w-40">
                  <Slider id="minsim" value={[minSim]} onValueChange={(v) => setMinSim(v[0] ?? 0.75)} min={0.5} max={0.95} step={0.01} />
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">{minSim.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="topk" className="text-sm text-muted-foreground">Top K</Label>
                <NumberInput
                  id="topk"
                  type="number"
                  value={topK}
                  min={1}
                  max={20}
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    setTopK(Number.isFinite(n) ? Math.max(1, Math.min(20, n)) : 5)
                  }}
                  className="w-20 h-8 text-sm"
                />
              </div>
            </>
          )}
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

      {dbPersist && (
        <div className="text-xs text-muted-foreground">DB persist: {dbPersist} • Chat ID: {chatId ?? '—'}</div>
      )}

      {/* Primary input: triggers server-side save + embeddings + stream */}
      <div className="flex gap-2">
        <EmbedInput onSubmitText={(text) => { sendPrompt(text) }} disabled={streaming || !isOnline} loading={streaming} />
      </div>

    </div>
    </>
  )
}
