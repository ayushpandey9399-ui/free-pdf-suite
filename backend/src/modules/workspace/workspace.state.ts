/**
 * File lifecycle state machine.
 * Responsibility: enforce the transitions declared in workspace.types.ts. A file may only
 * move along an edge that the architecture specification allows, and an illegal move is a
 * programming error that must surface loudly rather than silently corrupt a job.
 */
import { AppError, ErrorCode } from '../../core/errors.js';
import { HttpStatus } from '../../shared/http-status.js';
import { FILE_STATE_TRANSITIONS, type FileState } from './workspace.types.js';

/** True when the file may move from current to next. */
export function canTransition(current: FileState, next: FileState): boolean {
  return FILE_STATE_TRANSITIONS[current].includes(next);
}

/** Throw unless the transition is legal. */
export function assertTransition(current: FileState, next: FileState): void {
  if (!canTransition(current, next)) {
    throw new AppError(`Illegal file state transition ${current} -> ${next}`, {
      code: ErrorCode.E_INTERNAL,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      expected: false,
      details: { from: current, to: next },
    });
  }
}

/** States from which no further transition is possible. */
export function isTerminal(state: FileState): boolean {
  return FILE_STATE_TRANSITIONS[state].length === 0;
}

/** Every state reachable from the given state in one step. */
export function nextStates(state: FileState): readonly FileState[] {
  return FILE_STATE_TRANSITIONS[state];
}
