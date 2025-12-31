"use client";

import Image from "next/image";
import { useState } from "react";
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
import { removePhoto, restorePhoto } from "./api";
import { usePhotos } from "./usePhotos";
import { Img } from "./types";

type PendingDeleteState = {
  img: Img;
  blob: Blob | null;
};

export default function PhotosClient() {
  const { prefix, setPrefix, images, setImages, loading, seeding, error, setError, load, seedHeroImages } = usePhotos();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteState | null>(null);
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

  const requestDelete = async (img: Img) => {
    try {
      const res = await fetch(img.url);
      const blob = res.ok ? await res.blob() : null;
      setPendingDelete({ img, blob });
    } catch {
      setPendingDelete({ img, blob: null });
    } finally {
      setConfirmOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    const { img, blob } = pendingDelete;
    const previousImages = [...images];
    setImages((curr) => curr.filter((i) => i.path !== img.path));

    try {
      await removePhoto(img.path);
      toast.success(`${img.name} deleted`, {
        action: blob
          ? {
              label: "Undo",
              onClick: async () => {
                try {
                  const file = new File([blob], img.name, { type: blob.type || "application/octet-stream" });
                  await restorePhoto(img.path, file);
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
      setImages(previousImages);
      setError(e instanceof Error ? e.message : String(e));
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Photos</h1>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="Prefix (optional, e.g., hero; blank = all)"
          className="px-3 py-2 border rounded-md bg-transparent"
        />
        <button
          onClick={() => load(prefix)}
          disabled={loading}
          className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
        <button
          onClick={() => seedHeroImages()}
          disabled={seeding}
          className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {seeding ? "Importing..." : "Import hero images from public/edited"}
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
              This will permanently remove {pendingDelete?.img.name ?? "this photo"} from storage. You can Undo right after deletion.
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
