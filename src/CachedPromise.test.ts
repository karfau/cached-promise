import {spy} from 'sinon';
import {describe, expect, it} from '../test/runner.ts';
import {behaviorSubject} from '../test/behaviorSubject.ts';
import {CachedPromise} from './CachedPromise.ts';
import {
  Fulfilled,
  Loading,
  PState,
  Ready,
  Rejected,
} from './ValueErrorState.ts';

describe('CachedPromise', () => {
  it('should reset the cache when loading', async () => {
    const it = new CachedPromise(
      () => Promise.resolve({}),
      undefined,
      behaviorSubject,
    );
    const p = it.request();
    expect(it.state).toBeEqual(PState.loading);
    it.reset();
    const resetVES = it.valueErrorState;
    expect(resetVES).toBeEqual(Ready(it.initial));
    await expect(p).toBeResolvedWith(resetVES);
  });
  it('should reset the cache when fulfilled', async () => {
    const it = new CachedPromise(
      () => Promise.resolve({}),
      undefined,
      behaviorSubject,
    );
    const p = it.request();
    expect(it.state).toBeEqual(PState.loading);
    it.reset();
    expect(it._cache).toBeUndefined();
    const resetVES = it.valueErrorState;
    expect(resetVES).toBeEqual(Ready(it.initial));
    await expect(p).toBeResolvedWith(resetVES);
  });
  describe('impl without argument', () => {
    it(`should start in ready state, 
        all requests trigger impl only once and resolve with same ValueErrorState, 
        the value being the awaited value from impl, keeping a reference to the cached promise`, async () => {
      const initial = {},
        resolved = {};
      const impl = spy(() => Promise.resolve(resolved));
      const it = new CachedPromise(impl, initial, behaviorSubject);
      expect(it.value).toBe(initial);
      expect(impl).toBeCalled(0);
      expect(it._cache).toBeUndefined();
      expect(it.valueErrorState).toBeEqual(Ready(initial));
      expect(it.value).toBe(initial);

      const first = it.request();
      const firstLoadingVES = it.valueErrorState;
      expect(impl).toBeCalled(1);
      expect(it.value).toBe(initial);
      expect(firstLoadingVES).toBeEqual(Loading(initial));
      const firstCache = it._cache;
      expect(firstCache).toBeInstanceOf(Promise);

      const second = it.request();
      expect(impl).toBeCalled(1);
      expect(it.valueErrorState).toBe(firstLoadingVES);
      expect(it._cache).toBe(firstCache);

      const firstAwaited = await first;
      expect(firstAwaited)
        .toBe(it.valueErrorState)
        .toBeEqual(Fulfilled(resolved));
      await expect(second).toBeResolvedWith(firstAwaited);
      expect(it._cache).toBe(firstCache);
    });
    it('should skip loading state and reject on each request when impl throws instead of rejecting', async () => {
      const error = new Error('from impl');
      const impl = spy(() => {
        throw error;
      });
      const it = new CachedPromise(impl, undefined, behaviorSubject);

      const first = it.request();
      const firstVES = it.valueErrorState;
      expect(firstVES).toBeEqual(Rejected(undefined, error));
      expect(it._cache).toBeUndefined();
      expect(impl).toBeCalled(1);

      const second = it.request();
      expect(impl).toBeCalled(2);
      expect(it.valueErrorState)
        .not.toBe(firstVES)
        .toBeEqual(Rejected(undefined, error));

      await expect(first).toBeRejectedWith(error);
      await expect(second).toBeRejectedWith(error);
    });
    it('should transition from loading to rejected when impl rejects', async () => {
      const error = new Error('from impl');
      const impl = spy(async () => Promise.reject(error));
      const it = new CachedPromise(impl, undefined, behaviorSubject);

      const first = it.request();
      const firstVES = it.valueErrorState;
      expect(firstVES).toBeEqual(Loading(undefined));
      expect(it._cache).toBeInstanceOf(Promise);

      const firstCache = it._cache;
      expect(firstCache).toBeInstanceOf(Promise);

      const second = it.request();
      expect(impl).toBeCalled(1);
      expect(it.valueErrorState).toBe(firstVES);
      expect(it._cache).toBe(firstCache);

      await expect(first).toBeRejectedWith(error);

      const firstRejected = it.valueErrorState;
      expect(firstRejected)
        .toBe(it.valueErrorState)
        .toBeEqual(Rejected(undefined, error));
      expect(it._cache).toBeUndefined();

      await expect(second).toBeResolvedWith(firstRejected);
    });
  });
});
