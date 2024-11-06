import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/mongodb';

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  database: 'connected' | 'disconnected';
  uptime: number;
  version?: string;
  memory?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  system?: {
    platform: string;
    arch: string;
    version: string;
    nodeVersion: string;
  };
  connectionDetails?: {
    readyState: number;
    host?: string;
    name?: string;
  };
}

export async function GET() {
  try {
    // Ensure database connection is established
    await dbConnect();
    
    const dbState = mongoose.connection.readyState;
    const isConnected = dbState === 1;

    const mem = process.memoryUsage();

    const health: HealthResponse = {
      status: isConnected ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      database: isConnected ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      version: process.env.npm_package_version,
      connectionDetails: {
        readyState: dbState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      },
      memory: {
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        external: Math.round(mem.external / 1024 / 1024),
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        version: process.version,
        nodeVersion: process.versions.node,
      },
    };

    if (!isConnected) {
      console.error('Database connection failed. Ready state:', dbState);
    }

    return NextResponse.json(health, {
      status: isConnected ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 