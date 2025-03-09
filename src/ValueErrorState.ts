/**
 * The readonly object holding all named `PState`s.
 * It is also available as a union type,
 * so it can be used like an enum for types and values,
 * but also allows string literal values.
 */
export const PState = {
  /** The promise has not been triggered or has been reset. */
  ready: 'ready',
  /** The promise has been triggered but not settled. */
  loading: 'loading',
  /** The promise has been fulfilled. */
  rejected: 'rejected',
  /** The promise has been rejected. */
  fulfilled: 'fulfilled',
} as const;
/**
 * The union type of all possible `PState`s.
 * It is also available as a readonly object holding all named `PState`s,
 * so it can be used like an enum for types and values,
 * but also allows string literal values.
 */
export type PState = (typeof PState)[keyof typeof PState];

/**
 * A tuple representing the initial state, when the promise has not been triggered.
 */
export type Ready<T> = Readonly<
  [value: T, error: undefined, state: typeof PState.ready]
>;
/**
 * Helper to create a `Ready` tuple by just providing a value.
 */
export const Ready = <T>(value: T): Ready<T> => [
  value,
  undefined,
  PState.ready,
];
/**
 * A type-guard to check if a given PState is `ready`.
 */
export const isReady = (state: PState): state is typeof PState.ready =>
  state === PState.ready;

/**
 * A tuple representing the state of a promise that has been triggered but not settled.
 */
export type Loading<T> = Readonly<
  [value: T, error: undefined, state: typeof PState.loading]
>;
/**
 * Helper to create a `Loading` tuple by just providing a value.
 */
export const Loading = <T>(value: T): Loading<T> => [
  value,
  undefined,
  PState.loading,
];
/**
 * A type-guard to check if a given PState is `loading`.
 */
export const isLoading = (state: PState): state is typeof PState.loading =>
  state === PState.loading;

/**
 * A tuple representing the state of a promise that has not settled,
 * so is either in `ready` or `loading` state.
 */
export type Pending<T> = Ready<T> | Loading<T>;
/**
 * A type-guard to check if a given PState is `ready` or `loading`.
 */
export const isPending = (
  state: PState,
): state is typeof PState.ready | typeof PState.loading =>
  isLoading(state) || isReady(state);

/**
 * A tuple representing the state of a promise that has been fulfilled.
 */
export type Fulfilled<T> = Readonly<
  [value: T, error: undefined, state: typeof PState.fulfilled]
>;
/**
 * Helper to create a `Fulfilled` tuple by just providing a value.
 */
export const Fulfilled = <T>(value: T): Fulfilled<T> => [
  value,
  undefined,
  PState.fulfilled,
];
/**
 * A type-guard to check if a given PState is `fulfilled`.
 */
export const isFulfilled = (state: PState): state is typeof PState.fulfilled =>
  state === PState.fulfilled;

/**
 * A tuple representing the state of a promise that has been rejected.
 */
export type Rejected<T, E = unknown> = Readonly<
  [value: T, error: E, state: typeof PState.rejected]
>;
/**
 * Helper to create a `Rejected` tuple by just providing a value and the rejection reason.
 */
export const Rejected = <T, E = unknown>(
  value: T,
  error: E,
): Rejected<T, E> => [value, error, PState.rejected];
/**
 * A type-guard to check if a given PState is `rejected`.
 */
export const isRejected = (state: PState): state is typeof PState.rejected =>
  state === PState.rejected;

/**
 * A tuple representing the state of a promise,
 * that has either been fulfilled or rejected.
 */
export type Settled<T, E = unknown> = Fulfilled<T> | Rejected<T, E>;
/**
 * A type-guard to check if a given PState is `fulfilled` or `rejected`.
 */
export const isSettled = (
  state: PState,
): state is typeof PState.fulfilled | typeof PState.rejected =>
  isFulfilled(state) || isRejected(state);

/**
 * A tuple of a value, a potential error and the current state of a Promise,
 * that can be treated and updated as a single value.
 * Due to how promises work, the tuple can only have four types,
 * one for each PState, so it can be used as a union type.
 */
export type ValueErrorState<T, E = unknown> = Pending<T> | Settled<T, E>;
