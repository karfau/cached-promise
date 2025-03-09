import {describe, it, expect} from '../test/runner.ts';
import {ValueErrorStates} from './ValueErrorStates.ts';
import {Fulfilled, Loading, PState, Rejected} from './ValueErrorState.ts';

describe('ValueErrorStates', () => {
  it('should be ready with the initial value when created with undefined argument', () => {
    const it = new ValueErrorStates<undefined>(undefined);

    expect(it.value).toBeUndefined();
  });
  it('should be ready with the initial value when created with initial value', () => {
    const init = [] as const;
    const it = new ValueErrorStates(init);

    expect(it.value).toBe(init);
    expect(it.error).toBe(undefined);
    expect(it.state).toBe(PState.ready);
    expect(it.valueErrorState).toBeEqual([init, undefined, PState.ready]);
    expect(it.valueErrorState).toBe(it.READY);
    expect(it.isReady).toBe(true);
    expect(it.isPending).toBe(true);
    expect(it.isSettled).toBe(false);
  });

  it('should switch to loading state and back', () => {
    const initial = 0;
    const it = new ValueErrorStates(initial);

    const loading = 1;
    const returned = it._setValueErrorState(Loading(loading));

    expect(it.valueErrorState).toBe(returned);
    expect(it.value).toBe(loading);
    expect(it.isLoading).toBe(true);
    expect(it.isPending).toBe(true);
    expect(it.isSettled).toBe(false);

    it.reset();

    expect(it.valueErrorState).toBe(it.READY);
    expect(it.isPending).toBe(true);
    expect(it.isSettled).toBe(false);
  });
  it('should switch to fulfilled state and back', () => {
    const initial = 0;
    const it = new ValueErrorStates(initial);

    const fulfilled = 1;
    const returned = it._setValueErrorState(Fulfilled(fulfilled));

    expect(it.valueErrorState).toBe(returned);
    expect(it.value).toBe(fulfilled);
    expect(it.isFulfilled).toBe(true);
    expect(it.isSettled).toBe(true);
    expect(it.isPending).toBe(false);

    it.reset();

    expect(it.valueErrorState).toBe(it.READY);
    expect(it.isPending).toBe(true);
    expect(it.isSettled).toBe(false);
  });
  it('should switch to rejected state and back', () => {
    const initial = 0;
    const it = new ValueErrorStates(initial);

    const rejected = 1;
    const reason = 'reason';
    const returned = it._setValueErrorState(Rejected(rejected, reason));

    expect(it.valueErrorState).toBe(returned);
    expect(it.value).toBe(rejected);
    expect(it.error).toBe(reason);
    expect(it.isRejected).toBe(true);
    expect(it.isSettled).toBe(true);
    expect(it.isPending).toBe(false);

    it.reset();

    expect(it.valueErrorState).toBe(it.READY);
    expect(it.isPending).toBe(true);
    expect(it.isSettled).toBe(false);
  });
});
