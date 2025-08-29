// lib/functions/chunkText.ts
export interface Chunk {
    id: string;           // stable docId:chunkIndex
    text: string;
    start: number;        // char offset (optional)
    end: number;
  }
  
  /**
   * Split a large string into ~N-token chunks with optional overlap.
   *
   * @param text     Full document.
   * @param size     Target chunk size (chars or tokens).
   * @param overlap  Overlap size to preserve context.
   */
  export function chunkText(
    text: string,
    size = 1200,
    overlap = 200
  ): Chunk[] {
    const chunks: Chunk[] = [];
    let i = 0;
    while (i < text.length) {
      const slice = text.slice(i, i + size);
      chunks.push({
        id: crypto.randomUUID(),   // or `${docId}_${chunks.length}`
        text: slice,
        start: i,
        end: i + slice.length,
      });
      i += size - overlap;
    }
    return chunks;
  }