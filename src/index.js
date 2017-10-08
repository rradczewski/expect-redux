import actions from './actions';
import storeSpyLib from './storeSpy';

export const storeSpy = storeSpyLib;

const expectMatchers = {
  toDispatchAnAction: actions
};

const standaloneExpect = store =>
  Object.assign(
    {
      actual: store
    },
    expectMatchers
  );

export const expectRedux = Object.assign(standaloneExpect, expectMatchers);
