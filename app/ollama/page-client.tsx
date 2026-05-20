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
    <div className="rounded-2xl bg-slate-950/40 p-4 text-white">
      <Toaster richColors position="top-right" />
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="min-w-[220px] flex-1">
          <Label className="mb-2 block">Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
            <SelectContent>
              {models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Label className="mb-2 block">Temperature</Label>
          <Slider value={[temperature]} min={0} max={1} step={0.1} onValueChange={([v]) => setTemperature(v)} />
        </div>
        <div className="w-40">
          <Label className="mb-2 block">Top P</Label>
          <Slider value={[topP]} min={0} max={1} step={0.1} onValueChange={([v]) => setTopP(v)} />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2"><Switch checked={useContext} onCheckedChange={setUseContext} /><Label>Use context</Label></div>
        <div className="w-28"><Label className="mb-2 block">Top K</Label><NumberInput value={topK} onChange={(e) => setTopK(Number(e.target.value || 5))} /></div>
        <div className="w-28"><Label className="mb-2 block">Min Sim</Label><NumberInput value={minSim} onChange={(e) => setMinSim(Number(e.target.value || 0.75))} /></div>
      </div>

      <div className="mb-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
        {error ? <div className="text-red-300">{error}</div> : isOnline ? 'Ollama connection ready.' : 'Ollama appears offline.'}
        {dbPersist ? <div className="mt-1 text-xs text-slate-400">DB persist: {dbPersist}</div> : null}
        {siteOrigin ? <div className="mt-1 text-xs text-slate-500">Origin: {siteOrigin}</div> : null}
        {checkingOnline ? <div className="mt-1 text-xs text-slate-500">Checking Ollama...</div> : null}
      </div>

      <div className="mb-4 space-y-3 rounded-xl border border-white/10 bg-black/20 p-4 max-h-[420px] overflow-auto">
        {messages.length === 0 ? <div className="text-sm text-slate-400">No messages yet.</div> : messages.map((m, i) => (
          <div key={i} className={`rounded-lg p-3 text-sm ${m.role === 'user' ? 'bg-violet-500/20 text-violet-100' : 'bg-white/5 text-slate-100'}`}>
            <div className="mb-1 text-xs uppercase tracking-wide opacity-60">{m.role}</div>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
      </div>

      <EmbedInput onSubmitText={sendPrompt} disabled={streaming} loading={streaming} />

      <div className="mt-4 flex gap-3">
        <Button variant="outline" onClick={() => controllerRef.current?.abort()} disabled={!streaming}>Stop</Button>
        <Button variant="outline" onClick={() => { setMessages([]); if (model) localStorage.removeItem(`ollama_chat_${model}`) }}>Clear</Button>
      </div>
    </div>
  )
}
