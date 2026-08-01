/**
 * Service version and phase identity.
 * Responsibility: single place that states which build and which roadmap phase is
 * running, surfaced by health endpoints and the OpenAPI document.
 */
export const SERVICE_VERSION = '0.1.0';

/** Roadmap phase. Phase 0 is the foundation: no engines, no tools, no queue. */
export const SERVICE_PHASE = 'phase-0-foundation';
