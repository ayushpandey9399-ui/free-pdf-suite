/**
 * Process entry point.
 * Responsibility: start the HTTP server and, if startup itself fails, report the reason
 * on stderr and exit non zero so the container orchestrator restarts or halts the deploy.
 */
import { startServer } from './core/server.js';

try {
  await startServer();
} catch (error) {
  // The logger may not exist yet at this point, so stderr is the only safe channel.
  console.error('[pdftoolconverteronline-api] fatal startup error:', error);
  process.exit(1);
}
