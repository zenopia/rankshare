import { Connection } from 'mongoose';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      NEXT_PUBLIC_APP_URL: string;
    }
  }

  interface Global {
    mongoose: {
      conn: Connection | null;
      promise: Promise<Connection> | null;
    } | undefined;
  }
}

export {}; 