import { cleanupDeletedUsers } from './deleted-users';

// Run cleanup every day at 3 AM
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const INITIAL_DELAY = 5000; // 5 seconds initial delay

async function scheduleCleanup() {
  try {
    // Wait for initial delay
    await new Promise(resolve => setTimeout(resolve, INITIAL_DELAY));
    
    // Run cleanup immediately
    await cleanupDeletedUsers();
    
    // Schedule periodic cleanup
    setInterval(async () => {
      try {
        await cleanupDeletedUsers();
      } catch (error) {
        console.error('Error in scheduled cleanup:', error);
      }
    }, CLEANUP_INTERVAL);
    
    console.log('Cleanup scheduler started successfully');
  } catch (error) {
    console.error('Error starting cleanup scheduler:', error);
  }
}

// Start the scheduler if running directly
if (require.main === module) {
  scheduleCleanup().catch(error => {
    console.error('Fatal error in cleanup scheduler:', error);
    process.exit(1);
  });
}

export { scheduleCleanup }; 