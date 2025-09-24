"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function PhotosListPage() {
  const [prefix, setPrefix] = useState("hero");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<Array<{ name: string; path: string; url: string }>>([]);
  const [seeding, setSeeding] = useState(false);

  const load = async (p = prefix) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/photos?prefix=${encodeURIComponent(p)}&limit=100`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      setImages(Array.isArray(data?.images) ? data.images : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("hero");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Photos</h1>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="Prefix (e.g., hero)"
          className="px-3 py-2 border rounded-md bg-transparent"
        />
        <button
          onClick={() => load(prefix)}
          disabled={loading}
          className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
        <button
          onClick={async () => {
            setSeeding(true);
            setError(null);
            try {
              const res = await fetch('/api/photos/seed-hero', { method: 'POST' });
              const data = await res.json();
              if (!res.ok) throw new Error(data?.error || `Seed failed (${res.status})`);
              await load('hero');
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e));
            } finally {
              setSeeding(false);
            }
          }}
          disabled={seeding}
          className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {seeding ? 'Importing…' : 'Import current Hero images'}
        </button>
      </div>
      {error && <div className="mb-3 text-sm text-red-500">{error}</div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.map((img) => (
          <div key={img.path} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
            <Image src={img.url} alt={img.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate">{img.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
