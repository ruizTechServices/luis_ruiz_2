export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { githubConfig, isGithubConfigured } from "@/lib/clients/github";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const READ_METHODS = new Set(["GET", "HEAD"]);

type GithubEnvelope = {
  path?: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  raw?: boolean;
};

export async function GET(req: NextRequest) {
  return handleGithubProxy(req);
}

export async function HEAD(req: NextRequest) {
  return handleGithubProxy(req);
}

export async function POST(req: NextRequest) {
  return handleGithubProxy(req);
}

export async function PUT(req: NextRequest) {
  return handleGithubProxy(req);
}

export async function PATCH(req: NextRequest) {
  return handleGithubProxy(req);
}

export async function DELETE(req: NextRequest) {
  return handleGithubProxy(req);
}

async function handleGithubProxy(req: NextRequest) {
  const method = req.method.toUpperCase();
  const url = new URL(req.url);
  const rawParam = normalizeBoolean(url.searchParams.get("raw"));
  const pathParam = url.searchParams.get("path");

  let envelope: GithubEnvelope | null = null;
  let payload: unknown = undefined;
  let extraHeaders: Record<string, string> | undefined;
  let rawFlag = rawParam;

  if (!READ_METHODS.has(method)) {
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const json = (await req.json().catch(() => null)) as GithubEnvelope | null;
      if (json && typeof json === "object") {
        const isEnvelope =
          "path" in json || "query" in json || "body" in json || "headers" in json || "raw" in json;
        if (isEnvelope) {
          envelope = json;
          payload = json.body;
          extraHeaders = json.headers;
          if (typeof json.raw === "boolean") {
            rawFlag = json.raw;
          }
        } else {
          payload = json;
        }
      }
    } else if (req.body) {
      payload = await req.text();
    }
  }

  const path = envelope?.path ?? pathParam ?? "";
  if (!path) {
    return NextResponse.json(
      { error: "Missing required query param: path" },
      { status: 400 },
    );
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return NextResponse.json(
      { error: "Full URLs are not allowed. Provide a GitHub API path instead." },
      { status: 400 },
    );
  }

  const proxySecret = process.env.GITHUB_PROXY_SECRET?.trim();
  if (proxySecret) {
    const providedSecret = req.headers.get("x-github-proxy-secret") ?? "";
    if (providedSecret !== proxySecret) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  } else if (MUTATING_METHODS.has(method)) {
    return NextResponse.json(
      { error: "GITHUB_PROXY_SECRET must be set to allow mutating GitHub requests." },
      { status: 403 },
    );
  }

  if (MUTATING_METHODS.has(method) && !isGithubConfigured()) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN is required for mutating GitHub requests." },
      { status: 401 },
    );
  }

  const targetUrl = buildGithubUrl(path, url.searchParams, envelope?.query);
  const headers = buildGithubHeaders({
    extraHeaders,
    incomingContentType: req.headers.get("content-type"),
    hasBody: payload !== undefined,
  });

  const response = await fetch(targetUrl, {
    method,
    headers,
    body: shouldIncludeBody(method, payload) ? serializeBody(payload) : undefined,
  });

  return relayGithubResponse(response, rawFlag);
}

function buildGithubUrl(
  path: string,
  incomingParams: URLSearchParams,
  query?: GithubEnvelope["query"],
): string {
  const [rawPath, rawQuery] = path.split("?", 2);
  const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const target = new URL(normalizedPath, githubConfig.apiBaseUrl);

  const merged = new URLSearchParams(rawQuery ?? "");
  for (const [key, value] of incomingParams.entries()) {
    if (key === "path" || key === "raw") continue;
    merged.set(key, value);
  }

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      merged.set(key, String(value));
    }
  }

  const queryString = merged.toString();
  if (queryString) {
    target.search = queryString;
  }

  return target.toString();
}

function buildGithubHeaders({
  extraHeaders,
  incomingContentType,
  hasBody,
}: {
  extraHeaders?: Record<string, string>;
  incomingContentType: string | null;
  hasBody: boolean;
}): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": githubConfig.apiVersion,
  };

  if (githubConfig.token) {
    headers.Authorization = `Bearer ${githubConfig.token}`;
  }

  if (incomingContentType && hasBody) {
    headers["Content-Type"] = incomingContentType;
  } else if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      if (/^authorization$/i.test(key)) continue;
      headers[key] = value;
    }
  }

  return headers;
}

function shouldIncludeBody(method: string, payload: unknown): boolean {
  if (payload === undefined || payload === null) return false;
  if (method === "GET" || method === "HEAD") return false;
  return true;
}

function serializeBody(payload: unknown): BodyInit {
  if (payload instanceof Uint8Array) {
    const ab = new ArrayBuffer(payload.byteLength);
    new Uint8Array(ab).set(payload);
    return new Blob([ab]);
  }
  if (typeof payload === "string") return payload;
  return JSON.stringify(payload);
}

async function relayGithubResponse(response: Response, raw: boolean) {
  const headers = new Headers();
  for (const [key, value] of response.headers.entries()) {
    if (shouldForwardHeader(key)) {
      headers.set(key, value);
    }
  }

  if (response.status === 204 || response.status === 205) {
    return new NextResponse(null, { status: response.status, headers });
  }

  if (raw || !isJsonResponse(response)) {
    const text = await response.text();
    if (response.headers.get("content-type")) {
      headers.set("content-type", response.headers.get("content-type") as string);
    }
    return new NextResponse(text, { status: response.status, headers });
  }

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status, headers });
}

function shouldForwardHeader(header: string): boolean {
  const allowList = new Set([
    "x-ratelimit-limit",
    "x-ratelimit-remaining",
    "x-ratelimit-reset",
    "x-github-request-id",
    "etag",
    "link",
  ]);
  return allowList.has(header.toLowerCase());
}

function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
}

function normalizeBoolean(value: string | null): boolean {
  if (!value) return false;
  return value === "1" || value.toLowerCase() === "true";
}
