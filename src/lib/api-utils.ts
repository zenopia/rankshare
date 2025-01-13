import { NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import type { ApiResponse, ErrorResponse } from '@/types/api/responses';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, status: error.status },
      { status: error.status }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation Error', 
        status: 400,
        message: error.errors.map(e => e.message).join(', ')
      },
      { status: 400 }
    );
  }

  const message = error instanceof Error ? error.message : 'Internal Server Error';
  return NextResponse.json(
    { error: message, status: 500 },
    { status: 500 }
  );
}

export function apiResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ data, status }, { status });
}

export async function validateRequest<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  const data = await request.json();
  return schema.parse(data);
} 