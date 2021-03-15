import { configureStore } from './store';

it('allows to increase the counter locally', () => {
  const store = configureStore();
  expect(store.getState().counter).toEqual(0);
  store.dispatch({ type: 'INCREASE_COUNTER_LOCALLY' });
  expect(store.getState().counter).toEqual(1);
});

it('allows to set the counter from remote', () => {
  const store = configureStore();
  expect(store.getState().counter).toEqual(0);
  store.dispatch({ type: 'SET_COUNTER_FROM_REMOTE', counter: 3 });
  expect(store.getState().counter).toEqual(3);
});
