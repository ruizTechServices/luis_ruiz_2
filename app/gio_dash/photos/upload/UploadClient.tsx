"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DashboardCard,
  DashboardErrorState,
  DashboardPageHeader,
  DashboardPageShell,
} from "@/components/design-system/DashboardPrimitives";

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
    Array.from(files).forEach((file) => form.append("files", file));

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
    <DashboardPageShell>
      <DashboardPageHeader
        title="Upload Photos"
        description="Upload image files into Supabase Storage for managed site media."
        backHref="/gio_dash/photos"
        backLabel="Back to photos"
      />

      <DashboardCard className="max-w-2xl">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="photo-prefix">Prefix</Label>
            <Input
              id="photo-prefix"
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g., hero"
            />
            <p className="text-xs text-[var(--color-text-subtle)]">
              Images uploaded under this prefix will show in the hero slideshow if prefix is &apos;hero&apos;.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="photo-files">Files</Label>
            <Input
              id="photo-files"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              className="min-h-11"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
            <Button asChild variant="outline">
              <Link href="/gio_dash/photos">View Photos</Link>
            </Button>
          </div>
          {message ? <DashboardErrorState>{message}</DashboardErrorState> : null}
          {result !== null ? (
            <pre className="max-h-64 overflow-auto rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 text-xs text-[var(--color-text-primary)]">
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : null}
        </form>
      </DashboardCard>
    </DashboardPageShell>
  );
}
