import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      port: process.env.PORT,
      env: process.env.NODE_ENV
    },
    { status: 200 }
  );
} 