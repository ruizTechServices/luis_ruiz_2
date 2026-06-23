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

async function formatFetchError(res: Response, origin: string) {
  try {
    const contentType = res.headers.get('content-type')?.toLowerCase() ?? ''
    if (contentType.includes('application/json')) {
      const data = await res.json().catch(() => null)
      if (data && typeof data === 'object') {
        const message = typeof (data as { error?: unknown }).error === 'string'
          ? (data as { error?: string }).error
          : JSON.stringify(data)
        return `${origin} responded ${res.status}${message ? ` – ${message}` : ''}`
      }
    } else {
      const text = (await res.text().catch(() => '')).trim()
      if (text) {
        return `${origin} responded ${res.status} – ${text.slice(0, 400)}`
      }
    }
  } catch {}
  return `${origin} responded ${res.status}`
}

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
  const [checkingOnline] = useState<boolean>(false)
  const [baseUrl, setBaseUrl] = useState<string | null>(null)
  const [siteOrigin, setSiteOrigin] = useState<string>('')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        let list: string[] = []
        let latestError: string | null = null
        if (baseUrl) {
          const res = await fetch(`${baseUrl}/api/tags`, { cache: 'no-store' })
          if (res.ok) {
            const json = (await res.json()) as { models?: Array<{ name?: string }> }
            list = (json.models ?? []).map(m => m?.name).filter((n): n is string => Boolean(n))
            latestError = null
          }
        } else {
          const res = await fetch('/api/ollama/models', { cache: 'no-store' })
          const json = (await res.json()) as { models?: string[]; error?: string }
          list = Array.isArray(json.models) ? json.models : []
          latestError = typeof json.error === 'string' ? json.error : null
        }
        if (!active) return
        setModels(list)
        setError(latestError)
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
      } catch (e: unknown) {
        if (!active) return
        setModels([])
        setModel('')
        const message = e instanceof Error ? e.message : 'Failed to load local models'
        setError(message)
      }
    })()

    return () => {
      active = false
    }
  }, [baseUrl])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const h = await checkOllamaOnline(1500)
        if (!active) return
        setIsOnline(Boolean(h.online))
        setBaseUrl(h.baseUrl ?? null)
        if (!h.online) setError('Ollama server is not running.')
      } catch {}
    })()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    try {
      setSiteOrigin(window.location.origin)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('ollama_settings', JSON.stringify({ model, temperature, topP }))
    } catch {}
  }, [model, temperature, topP])

  useEffect(() => {
    if (!model) return
    try {
      const raw = localStorage.getItem(`ollama_chat_${model}`)
      setMessages(raw ? (JSON.parse(raw) as Array<{ role: 'user' | 'assistant'; content: string }>) : [])
    } catch {
      setMessages([])
    }
  }, [model])

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

  useEffect(() => {
    if (!model) return
    try {
      localStorage.setItem(`ollama_chat_${model}`, JSON.stringify(messages))
    } catch {}
  }, [messages, model])

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

    const nextMessages = [...messages, { role: 'user' as const, content: p }]
    setMessages(nextMessages)
    setStreaming(true)
    assistantBufferRef.current = ''
    controllerRef.current = new AbortController()

    try {
      if (baseUrl) {
        setDbPersist('off')
        const res = await fetch(`${baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
            stream: true,
            options: { temperature, top_p: topP },
          }),
          signal: controllerRef.current.signal,
        })

        if (!res.ok) throw new Error(await formatFetchError(res, `Ollama at ${baseUrl}`))
        if (!res.body) throw new Error(`Ollama at ${baseUrl} returned an empty response body`)

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let done = false
        let buffer = ''

        while (!done) {
          const { value, done: d } = await reader.read()
          done = d
          if (value) {
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''
            for (const line of lines) {
              const t = line.trim()
              if (!t) continue
              try {
                const evt = JSON.parse(t) as { message?: { content?: string }; done?: boolean }
                const piece = evt?.message?.content ?? ''
                if (piece) {
                  assistantBufferRef.current += piece
                  setMessages(curr => {
                    const last = curr[curr.length - 1]
                    if (last && last.role === 'assistant') return [...curr.slice(0, -1), { ...last, content: assistantBufferRef.current }]
                    return [...curr, { role: 'assistant' as const, content: assistantBufferRef.current }]
                  })
                }
                if (evt?.done) {
                  done = true
                  break
                }
              } catch {}
            }
          }
        }
      } else {
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

        if (!res.ok) throw new Error(await formatFetchError(res, '/api/ollama'))
        if (!res.body) throw new Error('Server response did not include a readable body')

        const hdr = res.headers.get('x-chat-id')
        if (hdr) {
          const id = Number(hdr)
          if (!Number.isNaN(id)) {
            setChatId(id)
            try { localStorage.setItem(`ollama_chatId_${model}`, String(id)) } catch {}
          }
        }

        const persistHdr = res.headers.get('x-db-persist')
        if (persistHdr) setDbPersist(persistHdr)
        if (persistHdr === 'on') {
          if (hdr) toast.success(`Saved to Supabase • Session ${hdr}`)
          else toast.success('Saved to Supabase')
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
              if (last && last.role === 'assistant') return [...curr.slice(0, -1), { ...last, content: assistantBufferRef.current }]
              return [...curr, { role: 'assistant' as const, content: assistantBufferRef.current }]
            })
          }
        }
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Request failed'
      setError(message)
    } finally {
      setStreaming(false)
      controllerRef.current = null
    }
  }

  return (
    <div className="rounded-md border bg-card p-4">
      <Toaster position="top-right" />

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="rounded-md border px-2 py-1">
          {error ? 'Needs attention' : isOnline ? 'Ollama ready' : 'Ollama offline'}
        </span>
        {dbPersist ? <span className="rounded-md border px-2 py-1">DB persist: {dbPersist}</span> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start">
        <div className="order-2 flex flex-col gap-4 lg:order-1">
          <section className="rounded-md border p-4">
            <h2 className="mb-3 text-lg font-semibold">Conversation</h2>
            <div className="flex h-[420px] flex-col gap-3 overflow-y-auto rounded-md border bg-background p-3 lg:h-[520px]">
              {messages.length === 0 ? (
                <div className="text-sm text-muted-foreground">No messages yet.</div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`max-w-[92%] rounded-md border p-3 text-sm ${
                      message.role === 'user' ? 'ml-auto bg-muted' : 'mr-auto bg-card'
                    }`}
                  >
                    <div className="mb-1 text-xs uppercase text-muted-foreground">{message.role}</div>
                    <div className="whitespace-pre-wrap leading-7">{message.content}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-md border p-4">
            <EmbedInput onSubmitText={sendPrompt} disabled={streaming} loading={streaming} />
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => controllerRef.current?.abort()} disabled={!streaming} className="w-full sm:w-auto">Stop</Button>
              <Button variant="outline" onClick={() => { setMessages([]); if (model) localStorage.removeItem(`ollama_chat_${model}`) }} className="w-full sm:w-auto">Clear</Button>
            </div>
          </section>
        </div>

        <div className="order-1 flex flex-col gap-4 lg:order-2">
          <section className="rounded-md border p-4">
            <h2 className="mb-4 text-lg font-semibold">Model settings</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                  <SelectContent>
                    {models.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                  <Label>Temperature</Label>
                  <span>{temperature.toFixed(1)}</span>
                </div>
                <Slider value={[temperature]} min={0} max={1} step={0.1} onValueChange={([value]) => setTemperature(value)} />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                  <Label>Top P</Label>
                  <span>{topP.toFixed(1)}</span>
                </div>
                <Slider value={[topP]} min={0} max={1} step={0.1} onValueChange={([value]) => setTopP(value)} />
              </div>
            </div>
          </section>

          <section className="rounded-md border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Retrieval</h2>
              <Switch checked={useContext} onCheckedChange={setUseContext} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Top K</Label>
                <NumberInput value={topK} onChange={(event) => setTopK(Number(event.target.value || 5))} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Min similarity</Label>
                <NumberInput value={minSim} onChange={(event) => setMinSim(Number(event.target.value || 0.75))} />
              </div>
            </div>
          </section>

          <section className="rounded-md border p-4 text-sm text-muted-foreground">
            {error ? <div>{error}</div> : isOnline ? 'Ollama connection ready.' : 'Ollama appears offline.'}
            {siteOrigin ? <div className="mt-2 text-xs">Origin: {siteOrigin}</div> : null}
            {checkingOnline ? <div className="mt-2 text-xs">Checking Ollama...</div> : null}
          </section>
        </div>
      </div>
    </div>
  )
}
