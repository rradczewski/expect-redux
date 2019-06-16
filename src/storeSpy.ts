import { Action, Store, StoreEnhancer } from "redux";
import { ActionMatcher } from "./action_matcher";

type SpyExtension = {
  actions: Array<Action>;
  registerMatcher: (matcher: ActionMatcher) => void;
  unregisterMatcher: (matcher: ActionMatcher) => void;
};

export type StoreWithSpy<S, A extends Action<any>> = Store<S, A> & SpyExtension;

const storeEnhancer: StoreEnhancer<SpyExtension, {}> = nextCreateStore => (
  reducer,
  initialState
) => {
  const actions: Array<Action> = [];
  const matchers = new Set<ActionMatcher>();

  const recorder = (state, action) => {
    actions.push(action);
    matchers.forEach(matcher => matcher.test(action));
    return reducer(state, action);
  };

  const store = nextCreateStore(recorder, initialState);

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
