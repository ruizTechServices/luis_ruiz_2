"use client";

import { useState } from "react";
import Link from "next/link";

type UploadResult = {
  uploaded: Array<{ name: string; path: string; url: string | null }>;
  errors: Array<{ name: string; message: string }>;
};

export default function UploadClient() {
  const [prefix, setPrefix] = useState("hero");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setResult(null);
    if (!files || files.length === 0) {
      setMessage("Please choose one or more files");
      return;
    }
    const form = new FormData();
    form.set("prefix", prefix);
    Array.from(files).forEach((f) => form.append("files", f));

    setIsUploading(true);
    try {
      const res = await fetch("/api/photos/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Upload failed (${res.status})`);
      }
      setResult(data);
      setMessage("Uploaded successfully");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Photos</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Prefix</label>
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="px-3 py-2 border rounded-md bg-transparent"
            placeholder="e.g., hero"
          />
          <p className="text-xs text-gray-500">Images uploaded under this prefix will show in the Hero slideshow if prefix is &apos;hero&apos;.</p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Files</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(e.target.files)}
            className="px-3 py-2 border rounded-md bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isUploading}
            className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {isUploading ? "Uploading…" : "Upload"}
          </button>
          <Link href="/gio_dash/photos" className="text-sm underline">View Photos</Link>
        </div>
        {message && <div className="text-sm">{message}</div>}
        {result !== null && (
          <pre className="text-xs bg-black/5 dark:bg-white/5 p-2 rounded-md overflow-auto max-h-64">{JSON.stringify(result, null, 2)}</pre>
        )}
      </form>
    </div>
  );
}
