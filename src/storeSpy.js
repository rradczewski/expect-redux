import { MatcherPromise } from "./matcher";

const storeEnhancer = nextCreateStore => (reducer, initialState, enhancer) => {
  const actions = [];
  const matchers = new Set();

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

  return Object.assign({}, store, {
    actions: actions,
    timeout: timeout,
    registerMatcher: registerMatcher,
    unregisterMatcher: unregisterMatcher
  });
};

export default storeEnhancer;
