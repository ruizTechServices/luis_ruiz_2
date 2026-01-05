import { Img } from "./types";

type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      isJsonRecord(data) && typeof data.error === "string"
        ? data.error
        : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

type ListPhotosResponse = {
  images?: Img[];
  error?: string;
};

export async function listPhotos(prefix: string, limit = 500): Promise<Img[]> {
  const res = await fetch(`/api/photos?prefix=${encodeURIComponent(prefix)}&limit=${limit}`, { cache: "no-store" });
  const data = await parseJsonOrThrow<ListPhotosResponse>(res);
  return Array.isArray(data.images) ? data.images : [];
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
