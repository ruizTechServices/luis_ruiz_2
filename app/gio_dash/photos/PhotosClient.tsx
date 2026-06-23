"use client";

import Image from "next/image";
import { useState } from "react";
import { TrashIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DashboardEmptyState,
  DashboardErrorState,
  DashboardPageHeader,
  DashboardPageShell,
} from "@/components/design-system/DashboardPrimitives";
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
    <DashboardPageShell>
      <DashboardPageHeader
        title="Photos"
        description="Manage Supabase Storage images used by public and owner surfaces."
      />
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="Prefix (optional, e.g., hero; blank = all)"
          className="min-h-11 w-full sm:w-80"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => load(prefix)}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => seedHeroImages()}
          disabled={seeding}
        >
          {seeding ? "Importing..." : "Import hero images from public/edited"}
        </Button>
      </div>
      {error ? <DashboardErrorState>{error}</DashboardErrorState> : null}
      {images.length === 0 && !loading ? (
        <DashboardEmptyState title="No photos found">
          Try a different prefix or upload images into Supabase Storage.
        </DashboardEmptyState>
      ) : null}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.map((img) => (
          <div
            key={img.path}
            className="group relative aspect-square overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] transition hover:border-[var(--color-border-strong)]"
          >
            <Image src={img.url} alt={img.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
            <div className="pointer-events-none absolute inset-0 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-[10px] text-[var(--color-action-on-primary)]">{img.name}</div>
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={() => downloadImage({ name: img.name, url: img.url })}
                title="Download"
                aria-label={`Download ${img.name}`}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={() => requestDelete(img)}
                title="Delete"
                className="text-[var(--color-signal-danger)]"
                aria-label={`Delete ${img.name}`}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
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
    </DashboardPageShell>
  );
}
