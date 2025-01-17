import { NextResponse } from 'next/server';
import { getListModel } from "@/lib/db/models-v2/list";

export async function GET() {
  try {
    // Test MongoDB connection
    const ListModel = await getListModel();
    await ListModel.findOne().lean();

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      environment: process.env.NODE_ENV,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      environment: process.env.NODE_ENV,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    }, { status: 500 });
  }
} 