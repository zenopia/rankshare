import { NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import { ApiError, ErrorType, createError } from './errors';
import type { ApiResponse, ErrorResponse } from '@/types/api/responses';
import DOMPurify from 'isomorphic-dompurify';

export { ApiError };

export function sanitizeInput(input: unknown): unknown {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input.trim());
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, sanitizeInput(value)])
    );
  }
  return input;
}

export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(error.toJSON(), { status: error.status });
  }

  if (error instanceof ZodError) {
    const apiError = createError({
      message: 'Validation Error',
      status: 400,
      type: ErrorType.VALIDATION,
      details: {
        errors: error.errors.map(e => ({
          path: e.path,
          message: e.message
        }))
      }
    });
    return NextResponse.json(apiError.toJSON(), { status: 400 });
  }

  const message = error instanceof Error ? error.message : 'Internal Server Error';
  const apiError = createError({
    message,
    status: 500,
    type: ErrorType.SERVER_ERROR
  });
  return NextResponse.json(apiError.toJSON(), { status: 500 });
}

export function apiResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ data, status }, { status });
}

export async function validateRequest<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  const data = await request.json();
  const sanitizedData = sanitizeInput(data);
  return schema.parse(sanitizedData);
} 