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

// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const isDeno: boolean = !!globalThis.Deno;
export const describe = (message: string, fn: () => void) => {
  if (isDeno) {
    describeD(message, fn);
  } else {
    void describeN(message, fn);
  }
};
export const it = (message: string, fn: () => void): void => {
  if (isDeno) {
    itD(message, fn);
  } else {
    void itN(message, fn);
  }
};
export const before = isDeno ? beforeD : beforeN;
export const beforeEach = isDeno ? beforeEachD : beforeEachN;
export const after = isDeno ? afterD : afterN;
export const afterEach = isDeno ? afterEachD : afterEachN;
