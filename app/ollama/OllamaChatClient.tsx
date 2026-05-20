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
    <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.82))] p-3 text-white shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl sm:p-5 lg:p-6">
      <Toaster richColors position="top-right" />

      <div className="mb-5 rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100/65">Ollama Lab</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-[2rem]">Local chat workspace</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300 sm:text-[15px]">
              A cleaner local model interface for prompt testing, streaming checks, and retrieval experiments without the muddy stacked-card feel.
            </p>
          </div>
          <div className="inline-flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
              {error ? 'Needs attention' : isOnline ? 'Ollama ready' : 'Ollama offline'}
            </div>
            {dbPersist ? (
              <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-slate-300">
                DB persist: {dbPersist}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start">
        <div className="space-y-4 order-2 lg:order-1">
          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100/65">Conversation</p>
                <p className="mt-1 text-sm text-slate-400">Stream responses here and keep space for actual back-and-forth.</p>
              </div>
            </div>

            <div className="h-[360px] overflow-y-auto space-y-3 rounded-[1.2rem] border border-white/8 bg-slate-950/40 p-3 sm:h-[420px] sm:p-4 lg:h-[520px]">
              {messages.length === 0 ? <div className="text-sm text-slate-400">No messages yet.</div> : messages.map((m, i) => (
                <div key={i} className={`rounded-[1.15rem] border p-3 sm:p-4 text-sm shadow-[0_10px_25px_rgba(15,23,42,0.10)] ${m.role === 'user' ? 'ml-auto max-w-[92%] border-sky-300/15 bg-sky-300/10 text-sky-50 sm:max-w-[85%]' : 'mr-auto max-w-[96%] border-white/10 bg-white/[0.06] text-slate-100 sm:max-w-[90%]'}`}>
                  <div className="mb-1 text-[10px] uppercase tracking-[0.2em] opacity-55">{m.role}</div>
                  <div className="whitespace-pre-wrap leading-7">{m.content}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-3 sm:p-4">
            <EmbedInput onSubmitText={sendPrompt} disabled={streaming} loading={streaming} />
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => controllerRef.current?.abort()} disabled={!streaming} className="w-full sm:w-auto">Stop</Button>
              <Button variant="outline" onClick={() => { setMessages([]); if (model) localStorage.removeItem(`ollama_chat_${model}`) }} className="w-full sm:w-auto">Clear</Button>
            </div>
          </div>
        </div>

        <div className="space-y-4 order-1 lg:order-2">
          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100/65">Model settings</p>
            <div className="mt-4 space-y-4">
              <div>
                <Label className="mb-2 block text-slate-200">Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="h-11 rounded-xl border-white/10 bg-slate-950/50"><SelectValue placeholder="Select model" /></SelectTrigger>
                  <SelectContent>
                    {models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <Label className="text-slate-200">Temperature</Label>
                  <span>{temperature.toFixed(1)}</span>
                </div>
                <Slider value={[temperature]} min={0} max={1} step={0.1} onValueChange={([v]) => setTemperature(v)} />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <Label className="text-slate-200">Top P</Label>
                  <span>{topP.toFixed(1)}</span>
                </div>
                <Slider value={[topP]} min={0} max={1} step={0.1} onValueChange={([v]) => setTopP(v)} />
              </div>
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100/65">Retrieval</p>
                <p className="mt-1 text-sm text-slate-400">Only use context when you actually want augmentation.</p>
              </div>
              <Switch checked={useContext} onCheckedChange={setUseContext} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label className="mb-2 block text-slate-200">Top K</Label>
                <NumberInput value={topK} onChange={(e) => setTopK(Number(e.target.value || 5))} className="h-11 rounded-xl border-white/10 bg-slate-950/50" />
              </div>
              <div>
                <Label className="mb-2 block text-slate-200">Min similarity</Label>
                <NumberInput value={minSim} onChange={(e) => setMinSim(Number(e.target.value || 0.75))} className="h-11 rounded-xl border-white/10 bg-slate-950/50" />
              </div>
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4 sm:p-5 text-sm text-slate-300">
            {error ? <div className="text-red-300">{error}</div> : isOnline ? 'Ollama connection ready.' : 'Ollama appears offline.'}
            {siteOrigin ? <div className="mt-2 text-xs text-slate-500">Origin: {siteOrigin}</div> : null}
            {checkingOnline ? <div className="mt-2 text-xs text-slate-500">Checking Ollama...</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
