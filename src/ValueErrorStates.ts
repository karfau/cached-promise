import {
  Fulfilled,
  isFulfilled,
  isLoading,
  isPending,
  isReady,
  isRejected,
  isSettled,
  Loading,
  Pending,
  PState,
  Ready,
  Rejected,
  Settled,
  ValueErrorState,
} from './ValueErrorState.ts';

/**
 * Manages different ValueErrorState tuples over time, and provides synchronous access to the current value, error and state.
 *
 * The subclasses differ in how the promise(s) triggering the changed values are created.
 */
export class ValueErrorStates<T, E = unknown> {
  readonly initial: Readonly<T>;

  constructor(initial: Readonly<T>) {
    this.initial = initial;
    this.#valueErrorState = this.READY = Ready(initial);
  }
  /**
   * The initial ValueErrorState, which will be reused when being reset.
   */
  readonly READY: Ready<T>;
  #valueErrorState: ValueErrorState<T, E>;
  /**
   * The current `ValueErrorState` tuple, which is a stable value as long as the state or value doesn't change.
   */
  get valueErrorState(): ValueErrorState<T, E> {
    return this.#valueErrorState;
  }

  /**
   * Update the valueErrorState to `next` and returns it.
   * This should be treated as a protected method,
   * but can be used to implement behavior without having to create a class.
   */
  public _setValueErrorState(next: Ready<T>): Ready<T>;
  public _setValueErrorState(next: Loading<T>): Loading<T>;
  public _setValueErrorState(next: Fulfilled<T>): Fulfilled<T>;
  public _setValueErrorState(next: Rejected<T, E>): Rejected<T, E>;
  public _setValueErrorState(next: Pending<T>): Pending<T>;
  public _setValueErrorState(next: Settled<T, E>): Settled<T, E>;
  public _setValueErrorState(
    next: ValueErrorState<T, E>,
  ): ValueErrorState<T, E>;
  public _setValueErrorState(
    next: ValueErrorState<T, E>,
  ): ValueErrorState<T, E> {
    this.#valueErrorState = next;
    return next;
  }
  /**
   * Reset `valueErrorState` to `READY`.
   */
  reset(): Ready<T> {
    return this._setValueErrorState(this.READY);
  }

  /** The current value, `initial` until a fulfilled value is available. */
  get value(): T {
    return this.#valueErrorState[0];
  }
  /** The current error in `PState.rejected`, otherwise `undefined`. */
  get error(): E | undefined {
    return this.#valueErrorState[1];
  }
  /** The current PState. */
  get state(): PState {
    return this.#valueErrorState[2];
  }

  get isLoading(): boolean {
    return isLoading(this.state);
  }

  get isReady(): boolean {
    return isReady(this.state);
  }

  get isPending(): boolean {
    return isPending(this.state);
  }

  get isFulfilled(): boolean {
    return isFulfilled(this.state);
  }

  get isRejected(): boolean {
    return isRejected(this.state);
  }

  get isSettled(): boolean {
    return isSettled(this.state);
  }
}
