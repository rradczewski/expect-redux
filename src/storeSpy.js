// @flow
import type { Store, StoreEnhancer } from 'redux';
import { MatcherPromise } from "./matcher";

export type Action = Object;
export type StoreWithSpy<S, A, D> = Store<S, A, D> & {
  actions: Array<Action>;
  timeout: (number) => void;
  registerMatcher: (MatcherPromise) => void;
  unregisterMatcher: (MatcherPromise) => void;
}

const storeEnhancer: StoreEnhancer<*, *, *> = nextCreateStore => (reducer, initialState, enhancer): StoreWithSpy<*, *, *> => {
  const actions: Array<Action> = [];
  const matchers = new Set<MatcherPromise>();

  const recorder = (state, action) => {
    actions.push(action);
    matchers.forEach(matcher => matcher.test(action));
    return reducer(state, action);
  };

  const store = nextCreateStore(recorder, initialState, enhancer);
  const timeout = timeoutMs =>
    matchers.forEach(matcher => matcher.fail(timeoutMs));

  const registerMatcher = matcher => {
    actions.forEach(action => matcher.test(action));
    matchers.add(matcher);
  };

  const unregisterMatcher = matcher => {
    matchers.delete(matcher);
  };

  return {
    ...store,
    actions,
    timeout,
    registerMatcher,
    unregisterMatcher
  };
};

export default storeEnhancer;
