import {
  Fulfilled,
  Loading,
  type Ready,
  Rejected,
  type ValueErrorState,
} from './ValueErrorState.ts';
import {SubscribableValueErrorState} from './SubscribableValueErrorState.ts';

export type AsyncValueErrorState<T, E = unknown> = Promise<
  ValueErrorState<T, E>
>;
export interface SetOptions<T, E = unknown> {
  loadingValue?: T;
  onError?: (error: E) => void;
}

/**
 * Provides a stable observable for a series of "independently created" promises.
 * The current ValueErrorState is updated when the current promise is `set`, is fulfilled or rejected.
 *
 * The only thing the promises need to have in common is the type.
 */
export class SubscribablePromises<
  T,
  E = unknown,
> extends SubscribableValueErrorState<T, E> {
  protected _current: Promise<T> | undefined;

  /**
   * Provides access to the last promise that has been `set` until it settles
   * or is reset.
   */
  public get(): Promise<T> | undefined {
    return this._current;
  }

  /**
   * Updates the current value, error and state according to the state of the Promise.
   * This method assumes that the async action has already been triggered,
   * so it switches to the `loading` state right away.
   *
   * When the Promise fulfills or rejects,
   * the value, error and state are updated accordingly.
   *
   * Only the last promise that was passed is able to modify the state:
   * When this method is called with a new promise while another one has not settled,
   * the first promise is ignored when it fulfills.
   * When calling `reset` while the current promise has not settled,
   * the state will change to `ready` and the result of the promise is ignored.
   * (The Promise that was previously returned will fulfill with the initial value.)
   *
   * @param p the promise that should be used to update the state of this instance.
   * @param loadingValue the value to use during the loading state, defaults to `initial`.
   * @param onError a callback that will be invoked before the returned Promise rejects.
   *
   * @returns a promise that fulfills with the current ValueErrorState,
   *          at the point in time when `p` is fulfilled.
   *          If `p` rejects, the returned Promise also rejects with the same error.
   *          (The value, error and state of this instance are still updated.)
   */
  async set(
    p: Promise<T>,
    {loadingValue = this.value, onError}: SetOptions<T, E> = {},
  ): AsyncValueErrorState<T, E> {
    this._current = p;
    this._setValueErrorState(Loading(loadingValue));
    try {
      const awaited = await p;
      if (this._current === p && this.isLoading) {
        return this._setValueErrorState(Fulfilled(awaited));
      }
    } catch (error: unknown) {
      if (this._current === p && this.isLoading) {
        onError?.(error as E);
        this._setValueErrorState(Rejected(this.initial, error as E));
        throw error;
      }
    } finally {
      if (this._current === p) {
        this._current = undefined;
      }
    }
    // fulfills the promise with the current value, error and state,
    // in case a new promise has been set,
    // at the point in time `p` settles, if it ever does.
    return this.valueErrorState;
  }

  public override reset(): Ready<T> {
    this._current = undefined;
    return super.reset();
  }
}
