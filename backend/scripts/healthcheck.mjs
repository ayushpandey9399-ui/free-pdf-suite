/**
 * Container health check.
 * Responsibility: probe the liveness endpoint with zero dependencies and exit 0 only
 * when the process answers. Used by Docker HEALTHCHECK and Compose.
 */
const port = process.env.PORT ?? '8080';
const url = `http://127.0.0.1:${port}/live`;

try {
  const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
  if (!response.ok) {
    console.error(`healthcheck failed: ${response.status}`);
    process.exit(1);
  }
  process.exit(0);
} catch (error) {
  console.error(`healthcheck error: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
