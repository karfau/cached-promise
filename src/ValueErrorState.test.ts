import {it, expect} from '../test/runner.ts';
import {
  Fulfilled,
  isFulfilled,
  isLoading,
  isPending,
  isReady,
  isRejected,
  isSettled,
  Loading,
  Ready,
  Rejected,
} from './ValueErrorState.ts';

it('should correctly create Ready', () => {
  const input = {};
  const [value, error, state] = Ready(input);
  expect(value).toBe(input);
  expect(error).toBe(undefined);
  expect(isReady(state)).toBe(true);
  expect(isPending(state)).toBe(true);
  expect(isSettled(state)).toBe(false);
});
it('should correctly create Loading', () => {
  const input = {};
  const [value, error, state] = Loading(input);
  expect(value).toBe(input);
  expect(error).toBe(undefined);
  expect(isLoading(state)).toBe(true);
  expect(isPending(state)).toBe(true);
  expect(isSettled(state)).toBe(false);
});
it('should correctly create Fulfilled', () => {
  const input = {};
  const [value, error, state] = Fulfilled(input);
  expect(value).toBe(input);
  expect(error).toBe(undefined);
  expect(isFulfilled(state)).toBe(true);
  expect(isSettled(state)).toBe(true);
  expect(isPending(state)).toBe(false);
});
it('should correctly create Rejected', () => {
  const input = {};
  const reason = 'no way';
  const [value, error, state] = Rejected(input, reason);
  expect(value).toBe(input);
  expect(error).toBe(reason);
  expect(isRejected(state)).toBe(true);
  expect(isSettled(state)).toBe(true);
  expect(isPending(state)).toBe(false);
});
