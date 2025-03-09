export type {Subscribable} from 'rxjs-interop';
import type {Observer, Subscribable} from 'rxjs-interop';

/**
 * Emulates a minimal subset of the `Subject` type provided by rxjs.
 */
export type Subject<T> = Subscribable<T> & Observer<T>;
/**
 * A method to create an instance of a Subject.
 * If it provides current state to late subscribers,
 * it should add `current` as the most recent value.
 */
export type SubjectFactory<T, S extends Subject<T> = Subject<T>> = (
  current: T,
) => S;
