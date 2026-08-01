/**
 * Shared application types.
 * Responsibility: small cross module types that do not belong to one layer.
 */

/** Anything that can be released during shutdown. */
export interface Closeable {
  close(): Promise<void> | void;
}

/** Deeply readonly view of a value, used for configuration objects. */
export type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;
