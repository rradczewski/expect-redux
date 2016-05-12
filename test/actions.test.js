import { createStore } from 'redux';
import { storeSpy, expectRedux } from '../src/';

import expect from 'expect';
import { identity, propEq } from 'ramda';

expect.extend(expectRedux);

describe('Testing actions', () => {
  const testPreviouslyDispatchedAction = (action, fun) =>
    it('works on previously dispatched actions', (done) => {
      const store = createStore(identity, {}, storeSpy);
      store.dispatch(action);
      return fun(store, done);
    });


  const testEventuallyDispatchedAction = (action, fun) =>
    it('works on eventually dispatched actions', (done) => {
      const store = createStore(identity, {}, storeSpy);
      process.nextTick(() => store.dispatch(action));
      return fun(store, done);
    });

  const testBoth = (action, fun) => {
    testPreviouslyDispatchedAction(action, fun);
    testEventuallyDispatchedAction(action, fun);
  };


  describe('ofType', () => {
    testBoth(
      { type: 'TEST_ACTION' },
      (store, done) =>
        expect(store)
          .toDispatchAnAction()
          .ofType('TEST_ACTION')
          .then(done, done)
    );
  });

  describe('matching(object)', () => {
    testBoth(
      { type: 'TEST_ACTION', payload: 1 },
      (store, done) =>
        expect(store)
          .toDispatchAnAction()
          .matching({ type: 'TEST_ACTION', payload: 1})
          .then(done, done)
    );
  });

  describe('matching(predicate)', () => {
    testBoth(
      { type: 'TEST_ACTION', payload: 42 },
      (store, done) =>
        expect(store)
          .toDispatchAnAction()
          .matching(propEq('payload', 42))
          .then(done, done)
    );
  });

  describe('ofType(type).matching(predicate)', () => {
    testBoth(
      { type: 'TEST_ACTION', payload: 42 },
      (store, done) =>
        expect(store)
          .toDispatchAnAction()
          .ofType('TEST_ACTION')
          .matching(propEq('payload', 42))
          .then(done, done)
    );
  });
});