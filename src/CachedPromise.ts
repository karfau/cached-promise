import {SubscribableValueErrorState} from './SubscribableValueErrorState.ts';
import type {SubjectFactory} from './Subject.ts';
import {
  Fulfilled,
  Loading,
  type Ready,
  Rejected,
  type ValueErrorState,
} from './ValueErrorState.ts';
import {type AsyncValueErrorState} from './SubscribablePromises.ts';

export class CachedPromise<T, E = unknown> extends SubscribableValueErrorState<
  T,
  E
> {
  /**
   * the implementation for handling a `request`.
   */
  readonly impl: () => Promise<T>;
  constructor(
    impl: () => Promise<T>,
    initial: T,
    _subjectFactory: SubjectFactory<ValueErrorState<T>>,
  ) {
    super(initial, _subjectFactory);
    this.impl = impl;
  }

  /**
   * in memory reference
   * of the last promise returned by `impl`.
   */
  protected cache: Promise<T> | undefined;

  /**
   * in memory reference of the last promise returned by `impl`.
   * @protected
   */
  get _cache(): Promise<T> | undefined {
    return this.cache;
  }

  /**
   * Provides cached access to the promise returned by `impl`.
   * Sets `valueErrorState` to `[this.value, undefined, 'loading']`.
   * Resolving/Rejecting will set the related state.
   *
   * The following actions invalidate the cache:
   * - the promise rejects
   * - calling `reset`
   * - calling `refresh` when not in state `PromiseState.loading`
   *
   * @returns the cached ValueErrorState promise
   */
  async request(): AsyncValueErrorState<T, E> {
    let p: Promise<T> | undefined;
    try {
      p = this.cache ?? this.impl();
    } catch (error) {
      this._setValueErrorState(Rejected(this.initial, error as E));
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      return Promise.reject(error as E);
    }
    try {
      if (this.cache !== p) {
        this.cache = p;
        this._setValueErrorState(Loading(this.value));
      }
      const awaited = await p;
      if (this.cache === p && this.isLoading) {
        return this._setValueErrorState(Fulfilled(awaited));
      }
    } catch (error: unknown) {
      if (this.cache === p && this.isLoading) {
        this._setValueErrorState(Rejected(this.initial, error as E));
        this.cache = undefined;
        throw error;
      }
    }
    // fulfills the promise with the current value, error and state,
    // in case a new promise has been set,
    // at the point in time `p` settles, if it ever does.
    return this.valueErrorState;
  }

  override reset(): Ready<T> {
    this.cache = undefined;
    return super.reset();
  }
}
