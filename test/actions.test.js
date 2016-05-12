import { createStore } from 'redux';
import { storeSpy, expectRedux } from '../src/';

import expect from 'expect';
import { identity, propEq } from 'ramda';

expect.extend(expectRedux);

describe('Testing actions', () => {
  const testPreviouslyDispatchedAction = (action, fun) =>
    it('works on previously dispatched actions', done => {
      const store = createStore(identity, {}, storeSpy);
      store.dispatch(action);
      return fun(store, done);
    });


  const testEventuallyDispatchedAction = (action, fun) =>
    it('works on eventually dispatched actions', done => {
      const store = createStore(identity, {}, storeSpy);
      setTimeout(() => store.dispatch(action));
      return fun(store, done);
    });

  const testSyncAndAsync = (action, fun) => {
    testPreviouslyDispatchedAction(action, fun);
    testEventuallyDispatchedAction(action, fun);
  };

  describe('ofType', () => {
    testSyncAndAsync(
      { type: 'TEST_ACTION' },
      (store, done) =>
        expect(store)
          .toDispatchAnAction()
          .ofType('TEST_ACTION')
          .then(done, done)
    );

    describe('does not succeed if it', () => {
      testSyncAndAsync(
        { type: 'TEST_ACTION' },
        (store, done) => {
          let failed = false;
          const fail = () => {
            failed = true;
            done(new Error('Should not happen'));
          };

          expect(store)
            .toDispatchAnAction()
            .ofType('ANOTHER_ACTION')
            .then(fail, fail);

          // Finish successfully after dispatching the action
          setTimeout(() => failed ? undefined : done(), 10);
        }
      )
    });
  });

  describe('matching(object)', () => {
    testSyncAndAsync(
      { type: 'TEST_ACTION', payload: 1 },
      (store, done) =>
        expect(store)
          .toDispatchAnAction()
          .matching({ type: 'TEST_ACTION', payload: 1})
          .then(done, done)
    );

    describe('does not succeed if it', () => {
      testSyncAndAsync(
        { type: 'TEST_ACTION', payload: 1 },
        (store, done) => {
          let failed = false;
          const fail = () => {
            failed = true;
            done(new Error('Should not happen'));
          };

          expect(store)
            .toDispatchAnAction()
            .matching({ type: 'TEST_ACTION', payload: 2})
            .then(fail, fail);

          // Finish successfully after dispatching the action
          setTimeout(() => failed ? undefined : done(), 10);
        }
      )
    });

  });

  describe('matching(predicate)', () => {
    testSyncAndAsync(
      { type: 'TEST_ACTION', payload: 42 },
      (store, done) =>
        expect(store)
          .toDispatchAnAction()
          .matching(propEq('payload', 42))
          .then(done, done)
    );

    describe('does not succeed if it', () => {
      testSyncAndAsync(
        { type: 'TEST_ACTION', payload: 42 },
        (store, done) => {
          let failed = false;
          const fail = () => {
            failed = true;
            done(new Error('Should not happen'));
          };

          expect(store)
            .toDispatchAnAction()
            .matching(propEq('payload', 43))
            .then(fail, fail);

          // Finish successfully after dispatching the action
          setTimeout(() => failed ? undefined : done(), 10);
        }
      )
    });
  });

  describe('ofType(type).matching(predicate)', () => {
    testSyncAndAsync(
      { type: 'TEST_ACTION', payload: 42 },
      (store, done) =>
        expect(store)
          .toDispatchAnAction()
          .ofType('TEST_ACTION')
          .matching(propEq('payload', 42))
          .then(done, done)
    );

    describe('does not succeed if it', () => {
      testSyncAndAsync(
        { type: 'TEST_ACTION', payload: 42 },
        (store, done) => {
          let failed = false;
          const fail = () => {
            failed = true;
            done(new Error('Should not happen'));
          };

          expect(store)
            .toDispatchAnAction()
            .ofType('TEST_ACTION')
            .matching(propEq('payload', 43))
            .then(fail, fail);

          // Finish successfully after dispatching the action
          setTimeout(() => failed ? undefined : done(), 10);
        }
      )
    });
  });
});