"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { TrashIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export type Img = { name: string; path: string; url: string };

export default function PhotosClient() {
  const [prefix, setPrefix] = useState("hero");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<Img[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Img | null>(null);
  const [deleting, setDeleting] = useState(false);

  const downloadImage = async (img: { name: string; url: string }) => {
    try {
      const res = await fetch(img.url);
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = img.name || "image";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const requestDelete = (img: Img) => {
    setPendingDelete(img);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    const img = pendingDelete;
    let blob: Blob | null = null;
    try {
      const res = await fetch(img.url);
      if (res.ok) blob = await res.blob();
    } catch {}

    const prev = images;
    setImages((curr) => curr.filter((i) => i.path !== img.path));
    try {
      const res = await fetch(`/api/photos?path=${encodeURIComponent(img.path)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Delete failed (${res.status})`);

      toast.success(`${img.name} deleted`, {
        action: blob
          ? {
              label: "Undo",
              onClick: async () => {
                try {
                  const file = new File([blob!], img.name, { type: blob!.type || "application/octet-stream" });
                  const form = new FormData();
                  form.set("path", img.path);
                  form.set("file", file);
                  const r = await fetch("/api/photos/restore", { method: "POST", body: form });
                  const rd = await r.json();
                  if (!r.ok) throw new Error(rd?.error || `Restore failed (${r.status})`);
                  await load(prefix);
                } catch (e) {
                  setError(e instanceof Error ? e.message : String(e));
                  toast.error("Undo failed");
                }
              },
            }
          : undefined,
        duration: 6000,
      });
    } catch (e) {
      setImages(prev);
      setError(e instanceof Error ? e.message : String(e));
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  };

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
              const res = await fetch("/api/photos/seed-hero", { method: "POST" });
              const data = await res.json();
              if (!res.ok) throw new Error(data?.error || `Seed failed (${res.status})`);
              await load("hero");
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e));
            } finally {
              setSeeding(false);
            }
          }}
          disabled={seeding}
          className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {seeding ? "Importing…" : "Import current Hero images"}
        </button>
      </div>
      {error && <div className="mb-3 text-sm text-red-500">{error}</div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.map((img) => (
          <div
            key={img.path}
            className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <Image src={img.url} alt={img.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate">{img.name}</div>
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => downloadImage({ name: img.name, url: img.url })}
                title="Download"
                className="p-1.5 rounded-md bg-white/80 hover:bg-white text-gray-800 shadow border"
                aria-label={`Download ${img.name}`}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => requestDelete(img)}
                title="Delete"
                className="p-1.5 rounded-md bg-white/80 hover:bg-white text-red-600 shadow border"
                aria-label={`Delete ${img.name}`}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {pendingDelete?.name ?? "this photo"} from storage. You can Undo right after deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster richColors />
    </div>
  );
}
