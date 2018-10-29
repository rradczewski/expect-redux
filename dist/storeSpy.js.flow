// @flow
import type { Store, StoreEnhancer } from "redux";
import { ActionMatcher } from "./action_matcher";

export type Action = Object;
export type StoreWithSpy<S, A, D> = Store<S, A, D> & {
  actions: Array<Action>,
  registerMatcher: ActionMatcher => void,
  unregisterMatcher: ActionMatcher => void
};

const storeEnhancer: StoreEnhancer<*, *, *> = nextCreateStore => (
  reducer,
  initialState,
  enhancer
): StoreWithSpy<*, *, *> => {
  const actions: Array<Action> = [];
  const matchers = new Set<ActionMatcher>();

  const recorder = (state, action) => {
    actions.push(action);
    matchers.forEach(matcher => matcher.test(action));
    return reducer(state, action);
  };

  const store = nextCreateStore(recorder, initialState, enhancer);

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
    registerMatcher,
    unregisterMatcher
  };
};

export default storeEnhancer;
