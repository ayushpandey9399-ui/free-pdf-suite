/**
 * Identifier helpers.
 * Responsibility: produce collision free ids for requests, jobs and workspaces.
 */
import { randomUUID } from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';

/** Correlation id for one inbound HTTP request. */
export function newRequestId(): string {
  return randomUUID();
}

/**
 * Id for a unit of work or a workspace directory.
 * Uses the uuid package so ids stay portable across runtimes and future workers.
 */
export function newJobId(): string {
  return uuidv4();
}
