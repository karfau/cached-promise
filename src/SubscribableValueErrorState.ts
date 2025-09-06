import type {Subject, SubjectFactory, Subscribable} from './Subject.ts';
import type {
  Fulfilled,
  Loading,
  Pending,
  Ready,
  Rejected,
  Settled,
  ValueErrorState,
} from './ValueErrorState.ts';
import {ValueErrorStates} from './ValueErrorStates.ts';

/**
 * Manages different ValueErrorState tuples over time, and provides synchronous access to the current value, error and state.
 *
 * The subclasses differ in how the promise(s) triggering the changed values are created.
 *
 * By providing a factory for a `Subject` (`Observer` + `Subscribable`),
 * updates of `valueErrorState` can be subscribed to.
 *
 * The subjectFactory is only invoked when accessing the `getValueErrorState$`.
 */
export class SubscribableValueErrorState<
  T,
  E = unknown,
> extends ValueErrorStates<T, E> {
  override readonly initial: Readonly<T>;

  protected _subjectFactory: SubjectFactory<ValueErrorState<T>>;

  constructor(
    initial: Readonly<T>,
    _subjectFactory: SubjectFactory<ValueErrorState<T>>,
  ) {
    super(initial);
    this._subjectFactory = _subjectFactory;
    this.initial = initial;
  }

  protected _subject: Subject<ValueErrorState<T, E>> | undefined;
  protected get subject(): Subject<ValueErrorState<T, E>> {
    this._subject ??= this._subjectFactory(this.valueErrorState);
    return this._subject;
  }

  public override _setValueErrorState(next: Ready<T>): Ready<T>;
  public override _setValueErrorState(next: Loading<T>): Loading<T>;
  public override _setValueErrorState(next: Fulfilled<T>): Fulfilled<T>;
  public override _setValueErrorState(next: Rejected<T, E>): Rejected<T, E>;
  public override _setValueErrorState(next: Pending<T>): Pending<T>;
  public override _setValueErrorState(next: Settled<T, E>): Settled<T, E>;
  public override _setValueErrorState(
    next: ValueErrorState<T, E>,
  ): ValueErrorState<T, E>;
  public override _setValueErrorState(
    next: ValueErrorState<T, E>,
  ): ValueErrorState<T, E> {
    super._setValueErrorState(next);
    this._subject?.next(next);
    return next;
  }

  /**
   * Provides a Subscribable to be notified about changes of `valueErrorState` over time.
   * Depending on the implementation provided by `subjectFactory`,
   * subscribing to it might replay the last value (like the rxjs `BehaviorSubject`) or not.
   * If it is not replayed, and you want to trigger your handler after the subscribing,
   * you have to call it directly.
   */
  getValueErrorState$(): Subscribable<ValueErrorState<T, E>> {
    return this.subject;
  }
}
