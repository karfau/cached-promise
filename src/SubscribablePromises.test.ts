import {spy} from 'sinon';
import {BehaviorSubject} from 'rxjs';
import {describe, expect, it} from '../test/runner.ts';
import {SubscribablePromises} from './SubscribablePromises.ts';
import {
  Fulfilled,
  Loading,
  PState,
  Ready,
  type ValueErrorState,
} from './ValueErrorState.ts';

const givenAResolvedSubscribablePromises = async <T>(
  initial: T,
  fulfilled: T,
) => {
  const impl = spy(async () => Promise.resolve(fulfilled));

  const it = new SubscribablePromises(
    initial,
    (current: ValueErrorState<T>) => new BehaviorSubject(current),
  );
  const result = await it.set(impl());

  expect(result).toBeEqual(Fulfilled(fulfilled));
  expect(it.valueErrorState).toBe(result);
  return {initial, impl, it, fulfilled};
};

function expectRejectedWithError<T>(it: SubscribablePromises<T>) {
  expect(it.state).toBeEqual(PState.rejected);
  expect(it.error).toBeInstanceOf(Error);
  expect(it.value).toBeEqual(it.initial);
}

describe('SubscribablePromises', () => {
  describe('from and reset update stateValue: [PState, value | error]', () => {
    it('should be ready >-set-> loading(1) >-set-> loading(2) >-resolves(1)-> loading(2) >-resolves(2)-> resolved(2)', async () => {
      let counter = 0;
      const subjectFactory = (current: ValueErrorState<number | undefined>) =>
        new BehaviorSubject(current);
      const impl = async () => Promise.resolve(++counter);

      const it = new SubscribablePromises<number | undefined>(
        counter,
        subjectFactory,
      );
      expect(it.isReady).toBe(true);

      const first = impl();
      const setFirst = it.set(first);
      expect(it.get()).toBe(first);
      expect(it.isReady).toBe(false);
      expect(it.state).toBeEqual(PState.loading);
      expect(it.isLoading).toBe(true);

      const second = impl();
      const setSecond = it.set(second);
      expect(it.get()).toBe(second);
      expect(it.state).toBeEqual(PState.loading);
      await first;
      expect(it.state).toBeEqual(PState.loading);
      await second;
      expect(it.valueErrorState).toBeEqual(Fulfilled(2));
      expect(it.get()).toBeUndefined();
      await expect(setSecond).toBeResolvedWith(Fulfilled(2));
      await expect(first).toBeResolvedWith(1);
      await expect(second).toBeResolvedWith(2);
      // the first promise is not affecting the state, sine it is not the current promise.
      // so it resolved to the loading state when it was done, this is never going to change.
      await expect(setFirst).toBeResolvedWith(Loading(0));
    });
    it('should be ready >-set-> loading(1) >-reset-> ready >-resolves(1)-> ready', async () => {
      let counter = 0;
      const subjectFactory = (current: ValueErrorState<number | undefined>) =>
        new BehaviorSubject(current);
      const impl = async () => Promise.resolve(++counter);

      const it = new SubscribablePromises<number | undefined>(
        counter,
        subjectFactory,
      );
      expect(it.isReady).toBe(true);

      const first = impl();
      const setFirst = it.set(first);
      expect(it.isReady).toBe(false);
      expect(it.state).toBeEqual(PState.loading);
      expect(it.isLoading).toBe(true);

      it.reset();

      await expect(first).toBeResolvedWith(1);
      // the promise is not affecting the state, since the state is not `loading`.
      // so it resolves to the ready state when it is done, this is never going to change.
      await expect(setFirst).toBeResolvedWith(Ready(0));
      expect(it.state).toBeEqual(PState.ready);
      expect(it.valueErrorState).toBeEqual(Ready(0));
    });
    it('should be ... resolved >-set-> loading(2) >-resolve-> resolved', async () => {
      const {impl, it, fulfilled} = await givenAResolvedSubscribablePromises(
        false,
        true,
      );

      const second = it.set(impl());
      expect(it.valueErrorState).toBeEqual(Loading(fulfilled));

      const secondResult = await second;
      expect(secondResult).toBeEqual(Fulfilled(fulfilled));
      expect(it.valueErrorState).toBeEqual(secondResult);
    });
    it('should be ... resolved >-reset-> ready >-set-> loading(2) >-resolve-> resolved', async () => {
      const {initial, impl, it, fulfilled} =
        await givenAResolvedSubscribablePromises(false, true);

      it.reset();
      expect(it.valueErrorState).toBeEqual(it.READY);

      const second = it.set(impl());
      expect(it.valueErrorState).toBeEqual([
        initial,
        undefined,
        PState.loading,
      ]);

      const secondResult = await second;
      expect(secondResult).toBeEqual(Fulfilled(fulfilled));
      expect(it.valueErrorState).toBeEqual(secondResult);
    });
    it('should be ready >-set-> loading(1) >-reject-> rejected >-set-> loading(2) >-reject-> rejected', async () => {
      const initial = false;
      const subjectFactory = (current: ValueErrorState<boolean>) =>
        new BehaviorSubject(current);
      const reason = new Error('promise rejected in test');
      const impl = async () => Promise.reject(reason);

      const it = new SubscribablePromises(initial, subjectFactory);

      const first = it.set(impl());
      expect(it.valueErrorState).toBeEqual(Loading(initial));

      await expect(first).toBeRejectedWith(reason);
      expectRejectedWithError(it);

      const second = it.set(impl());
      expect(it.valueErrorState).toBeEqual(Loading(initial));

      await expect(second).toBeRejectedWith(reason);
      expectRejectedWithError(it);
    });
  });
  describe('valueErrorState$', () => {
    it('should push all possible states', async () => {
      const subjectFactory = (current: ValueErrorState<undefined>) =>
        new BehaviorSubject(current);

      const it = new SubscribablePromises<undefined>(undefined, subjectFactory);

      const states: PState[] = [];
      const first = it.set(Promise.resolve(undefined)); // -> loading(1)
      const observable = it.getValueErrorState$();
      expect(it.state).toBe(PState.loading);

      observable.subscribe({
        next: ([_, __, state]: ValueErrorState<undefined>) => {
          states.push(state);
        },
      });

      await first; // -> resolved

      const reason = new Error('set test');
      await expect(
        it.set(Promise.reject(reason)), // -> loading(2)
      ).toBeRejectedWith(reason);
      // -> rejected

      it.reset(); // -> ready

      expect(states).toBeEqual([
        PState.loading,
        PState.fulfilled,
        PState.loading,
        PState.rejected,
        PState.ready,
      ] as const);
    });
    it('should be stable', () => {
      const subjectFactory = (current: ValueErrorState<undefined>) =>
        new BehaviorSubject(current);
      const it = new SubscribablePromises(undefined, subjectFactory);

      const observable = it.getValueErrorState$();

      expect(it.getValueErrorState$()).toBe(observable);
    });
  });
});
