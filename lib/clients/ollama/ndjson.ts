// lib/clients/ollama/ndjson.ts
export async function* parseNDJSON(
    reader: ReadableStreamDefaultReader<Uint8Array>
  ) {
    const decoder = new TextDecoder();
    let buffer = "";
  
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
  
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
  
      for (const line of lines) {
        const s = line.trim();
        if (!s) continue;
        try {
          yield JSON.parse(s);
        } catch {
          // ignore malformed lines; continue streaming
        }
      }
    }
  
    const tail = buffer.trim();
    if (tail) {
      try { yield JSON.parse(tail); } catch {}
    }
  }
  