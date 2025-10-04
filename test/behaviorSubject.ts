import {BehaviorSubject} from 'rxjs';
import type {ValueErrorState} from '../src/index.ts';

export const behaviorSubject = <T, E = unknown>(
  current: ValueErrorState<T, E>,
): BehaviorSubject<ValueErrorState<T, E>> => new BehaviorSubject(current);
