import { NextResponse } from "next/server";

/**
 * Standard API error response factory.
 */
export function apiError(
  message: string,
  code: string,
  status: number,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    { error: message, code, ...(details ? { details } : {}) },
    { status }
  );
}

/**
 * Standard API success response factory.
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}
