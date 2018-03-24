import { createStore } from 'redux';
import { storeSpy, expectRedux } from '../src/';

import { identity, propEq } from 'ramda';

const testPreviouslyDispatchedAction = (action, fun) =>
  it('on previously dispatched actions', done => {
    const store = createStore(identity, {}, storeSpy);
    store.dispatch(action);
    fun(store, done);
  });

const testEventuallyDispatchedAction = (action, fun) =>
  it('on eventually dispatched actions', done => {
    const store = createStore(identity, {}, storeSpy);
    setTimeout(() => store.dispatch(action));
    fun(store, done);
  });

const testSyncAndAsync = (action, fun) => {
  testPreviouslyDispatchedAction(action, fun);
  testEventuallyDispatchedAction(action, fun);
};

describe('Testing actions', () => {
  describe('ofType', () => {
    testSyncAndAsync({ type: 'TEST_ACTION' }, (store, done) =>
      expectRedux(store)
        .toDispatchAnAction()
        .ofType('TEST_ACTION')
        .then(done, done)
    );

    describe('does not succeed if no action matches', () => {
      testSyncAndAsync({ type: 'TEST_ACTION' }, (store, done) => {
        let failed = false;
        const fail = () => {
          failed = true;
          done(new Error('Should not happen'));
        };

        expectRedux(store)
          .toDispatchAnAction()
          .ofType('ANOTHER_ACTION')
          .then(fail, fail);

        // Finish successfully after dispatching the action
        setTimeout(() => (failed ? undefined : done()), 10);
      });
    });
  });

  describe('matching(object)', () => {
    testSyncAndAsync({ type: 'TEST_ACTION', payload: 1 }, (store, done) =>
      expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'TEST_ACTION', payload: 1 })
        .then(done, done)
    );

    describe('does not succeed if no action matches', () => {
      testSyncAndAsync({ type: 'TEST_ACTION', payload: 1 }, (store, done) => {
        let failed = false;
        const fail = () => {
          failed = true;
          done(new Error('Should not happen'));
        };

        expectRedux(store)
          .toDispatchAnAction()
          .matching({ type: 'TEST_ACTION', payload: 2 })
          .then(fail, fail);

        // Finish successfully after dispatching the action
        setTimeout(() => (failed ? undefined : done()), 10);
      });
    });
  });

  describe('matching(predicate)', () => {
    testSyncAndAsync({ type: 'TEST_ACTION', payload: 42 }, (store, done) =>
      expectRedux(store)
        .toDispatchAnAction()
        .matching(propEq('payload', 42))
        .then(done, done)
    );

    describe('does not succeed if no action matches', () => {
      testSyncAndAsync({ type: 'TEST_ACTION', payload: 42 }, (store, done) => {
        let failed = false;
        const fail = () => {
          failed = true;
          done(new Error('Should not happen'));
        };

        expectRedux(store)
          .toDispatchAnAction()
          .matching(propEq('payload', 43))
          .then(fail, fail);

        // Finish successfully after dispatching the action
        setTimeout(() => (failed ? undefined : done()), 10);
      });
    });
  });

  describe('ofType(type).matching(predicate)', () => {
    testSyncAndAsync({ type: 'TEST_ACTION', payload: 42 }, (store, done) =>
      expectRedux(store)
        .toDispatchAnAction()
        .ofType('TEST_ACTION')
        .matching(propEq('payload', 42))
        .then(() => done(), done)
    );

    it('should only match ONE action that satisfies both predicates', done => {
      const store = createStore(identity, {}, storeSpy);
      store.dispatch({ type: 'TEXT_ACTION_1', payload: 1 });
      store.dispatch({ type: 'TEXT_ACTION_2', payload: 2 });

      let failed = false;
      const fail = () => {
        failed = true;
        done(
          new Error(
            'Predicates individually matched for at least one single action, but not for exactly the same'
          )
        );
      };

      expectRedux(store)
        .toDispatchAnAction()
        .ofType('TEST_ACTION_1')
        .matching(propEq('payload', 2))
        .then(fail);

      setTimeout(() => (failed ? undefined : done()), 10);
    });

    describe('does not succeed if no action matches', () => {
      testSyncAndAsync({ type: 'TEST_ACTION', payload: 42 }, (store, done) => {
        let failed = false;
        const fail = () => {
          failed = true;
          done(new Error('Should not happen'));
        };

        expectRedux(store)
          .toDispatchAnAction()
          .ofType('TEST_ACTION')
          .matching(propEq('payload', 43))
          .then(fail, fail);

        // Finish successfully after dispatching the action
        setTimeout(() => (failed ? undefined : done()), 10);
      });
    });
  });
});
