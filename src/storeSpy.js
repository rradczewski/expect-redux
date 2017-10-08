export default nextCreateStore => (reducer, initialState, enhancer) => {
  const actions = [];
  const expectations = [];

  const checkExpectations = action =>
    expectations.forEach(expectation => expectation(action));

  const recorder = (state, action) => {
    actions.push(action);
    checkExpectations(action);
    return reducer(state, action);
  };

  const store = nextCreateStore(recorder, initialState, enhancer);
  store.actions = actions;
  store.expectations = expectations;

  return store;
};
