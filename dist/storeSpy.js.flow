// @flow
import type { StoreEnhancer, Store } from 'redux';

export type Action = { type: $Subtype<string> };
export type StoreShape<S, A, D> = Store<S, A, D> & {
  actions: Array<Action>,
  expectations: Array<(Action) => void>
};

const storeEnhancer: StoreEnhancer<*, *, *> = nextCreateStore => (
  reducer,
  initialState,
  enhancer
) => {
  const actions: Array<Action> = [];
  const expectations: Array<(Action) => void> = [];

  const checkExpectations = (action: Action): void =>
    expectations.forEach(expectation => expectation(action));

  const recorder = (state, action) => {
    actions.push(action);
    checkExpectations(action);
    return reducer(state, action);
  };

  const store = nextCreateStore(recorder, initialState, enhancer);

  return (Object.assign({}, store, {
    actions,
    expectations
  }): StoreShape<*, *, *>);
};

export default storeEnhancer;
