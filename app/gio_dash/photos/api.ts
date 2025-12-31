import { Img } from "./types";

type ApiResult<T> = T | never;

async function parseJsonOrThrow(res: Response): Promise<ApiResult<any>> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data && (data.error as string)) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export async function listPhotos(prefix: string, limit = 500): Promise<Img[]> {
  const res = await fetch(`/api/photos?prefix=${encodeURIComponent(prefix)}&limit=${limit}`, { cache: "no-store" });
  const data = await parseJsonOrThrow(res);
  return Array.isArray(data?.images) ? (data.images as Img[]) : [];
}

export async function seedHero(): Promise<void> {
  const res = await fetch("/api/photos/seed-hero", { method: "POST" });
  await parseJsonOrThrow(res);
}

export async function removePhoto(path: string): Promise<void> {
  const res = await fetch(`/api/photos?path=${encodeURIComponent(path)}`, { method: "DELETE" });
  await parseJsonOrThrow(res);
}

export async function restorePhoto(path: string, file: File): Promise<void> {
  const form = new FormData();
  form.set("path", path);
  form.set("file", file);

  const res = await fetch("/api/photos/restore", { method: "POST", body: form });
  await parseJsonOrThrow(res);
}
