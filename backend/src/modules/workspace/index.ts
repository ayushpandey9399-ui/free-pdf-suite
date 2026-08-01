/**
 * Workspace module barrel.
 * Responsibility: single import surface for workspace contracts, the state machine,
 * local storage, the manager and the TTL sweeper.
 */
export * from './workspace.types.js';
export * from './workspace.state.js';
export * from './workspace.storage.js';
export * from './workspace.manager.js';
export * from './workspace.sweeper.js';
