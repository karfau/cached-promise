import {
  describe as describeD,
  it as itD,
  after as afterD,
  afterEach as afterEachD,
  before as beforeD,
  beforeEach as beforeEachD,
} from '@std/testing/bdd';
import {
  describe as describeN,
  it as itN,
  after as afterN,
  afterEach as afterEachN,
  before as beforeN,
  beforeEach as beforeEachN,
} from 'node:test';
export * from '@assertive-ts/core';
import {usePlugin} from '@assertive-ts/core';
import {SinonPlugin} from '@assertive-ts/sinon';
usePlugin(SinonPlugin);

export const isDeno: boolean = 'Deno' in globalThis;
type Fn = () => void;
export const describe = (message: string, fn: Fn): void => {
  if (isDeno) {
    describeD(message, fn);
  } else {
    void describeN(message, fn);
  }
};
export const it = (message: string, fn: Fn): void => {
  if (isDeno) {
    itD(message, fn);
  } else {
    void itN(message, fn);
  }
};
export const before: (fn: Fn) => void = isDeno ? beforeD : beforeN;
export const beforeEach: (fn: Fn) => void = isDeno ? beforeEachD : beforeEachN;
export const after: (fn: Fn) => void = isDeno ? afterD : afterN;
export const afterEach: (fn: Fn) => void = isDeno ? afterEachD : afterEachN;
