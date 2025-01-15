import { headers } from 'next/headers';

/**
 * Utility function to help with database migration.
 * Returns true if the request should use the V2 database.
 */
export function shouldUseV2Database(): boolean {
  try {
    // Check for explicit header
    const headersList = headers();
    const useV2 = headersList.get('x-use-v2-db');
    if (useV2 === 'true') return true;
    if (useV2 === 'false') return false;

    // Default to V2 for new requests
    return true;
  } catch {
    // Headers() will throw in non-request contexts (like background jobs)
    // Default to V2 in these cases
    return true;
  }
}

/**
 * Logs database access for debugging purposes during migration
 */
export function logDatabaseAccess(context: string, isV2: boolean) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DB Access] ${context} using ${isV2 ? 'V2' : 'V1'} database`);
  }
} 