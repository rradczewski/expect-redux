import { createStore } from 'redux';
import { storeSpy, expectRedux } from '../src/';
import { identity } from 'ramda';

const storeFactory = () => createStore(identity, {}, storeSpy);

describe('expectRedux(store).toDispatchAnAction()', () => {
  it('matching(obj)', () => {
    const store = storeFactory();
    store.dispatch({ type: 'MY_TYPE', payload: 42 });
    return expectRedux(store)
      .toDispatchAnAction()
      .matching({ type: 'MY_TYPE', payload: 42 });
  });

  it('matching(predicate)', () => {
    const store = storeFactory();
    store.dispatch({ type: 'MY_TYPE', payload: 42 });
    return expectRedux(store)
      .toDispatchAnAction()
      .matching(action => action.payload === 42);
  });

  it('ofType(str)', () => {
    const store = storeFactory();
    store.dispatch({ type: 'MY_TYPE' });
    return expectRedux(store)
      .toDispatchAnAction()
      .ofType('MY_TYPE');
  });

  it('ofType(str).matching(obj)', () => {
    const store = storeFactory();
    store.dispatch({ type: 'MY_TYPE', payload: 42 });
    return expectRedux(store)
      .toDispatchAnAction()
      .ofType('MY_TYPE')
      .matching({ type: 'MY_TYPE', payload: 42 });
  });

  it('ofType(str).matching(predicate)', () => {
    const store = storeFactory();
    store.dispatch({ type: 'MY_TYPE', payload: 42 });
    return expectRedux(store)
      .toDispatchAnAction()
      .ofType('MY_TYPE')
      .matching(action => action.payload === 42);
  });
});
