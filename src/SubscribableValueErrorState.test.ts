import {assertType, type IsExact} from '@std/testing/types';
import {spy} from 'sinon';
import {describe, it, expect} from '../test/runner.ts';
import {SubscribableValueErrorState} from './SubscribableValueErrorState.ts';
import {Fulfilled, Loading, type ValueErrorState} from './ValueErrorState.ts';
import {behaviorSubject} from '../test/behaviorSubject.ts';

describe('SubscribableValueErrorState', () => {
  it('should not call the subjectFactory until subject is requested', () => {
    const subjectFactory = spy(behaviorSubject<number>);

    const it = new SubscribableValueErrorState(0, subjectFactory);

    const loading = it._setValueErrorState(Loading(1));
    assertType<IsExact<typeof loading, Loading<number>>>(true);

    expect(subjectFactory).toNeverBeCalled();

    const requested = it.getValueErrorState$();

    expect(subjectFactory).toBeCalledOnce().toHaveArgs(loading);

    const next = spy((_: ValueErrorState<number>) => undefined);
    requested.subscribe({next});
    expect(next).toBeCalledOnce().toHaveArgs(loading);

    const fulfilled = it._setValueErrorState(Fulfilled(2));
    expect(next).toBeCalledTwice().toHaveArgs(fulfilled);
  });
});
