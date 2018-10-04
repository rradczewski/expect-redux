import { MatcherPromise } from "./matcher";
import { testSymbol, failSymbol } from "./matcher";

export const registerMatcherSymbol = Symbol.for(
  "expectredux_registerMatcherSymbol"
);
export const unregisterMatcherSymbol = Symbol.for(
  "expectredux_unregisterMatcherSymbol"
);
export const timeoutSymbol = Symbol.for("expectredux_timeoutSymbol");
export const actionsSymbol = Symbol.for("expectredux_actionsSymbol");

const storeEnhancer = nextCreateStore => (reducer, initialState, enhancer) => {
  const actions = [];
  const matchers = new Set();

  const recorder = (state, action) => {
    actions.push(action);
    matchers.forEach(matcher => matcher[testSymbol](action));
    return reducer(state, action);
  };

  const store = nextCreateStore(recorder, initialState, enhancer);
  const timeout = timeoutMs =>
    matchers.forEach(matcher => matcher[failSymbol](timeoutMs));

  const registerMatcher = matcher => {
    actions.forEach(action => matcher[testSymbol](action));
    matchers.add(matcher);
  };
  const unregisterMatcher = matcher => {
    matchers.delete(matcher);
  };

  return Object.assign({}, store, {
    [actionsSymbol]: actions,
    [timeoutSymbol]: timeout,
    [registerMatcherSymbol]: registerMatcher,
    [unregisterMatcherSymbol]: unregisterMatcher
  });
};

export default storeEnhancer;
