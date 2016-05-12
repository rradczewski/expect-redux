import { createStore } from 'redux';
import { storeSpy, expectRedux } from '../src/';

import expect from 'expect';
import { identity } from 'ramda';

expect.extend(expectRedux);

describe('Testing actions', () => {
  describe('ofType', () => {
    it('works on previously dispatched actions', (done) => {
      const store = createStore(identity, {}, storeSpy);

      store.dispatch({ type: 'TEST_ACTION' });

      expect(store)
        .toDispatchAnAction()
        .ofType('TEST_ACTION')
        .then(done, done);
    });

    it('works on eventually dispatched actions', (done) => {
      const store = createStore(identity, {}, storeSpy);

      expect(store)
        .toDispatchAnAction()
        .ofType('TEST_ACTION')
        .then(done, done);

      store.dispatch({ type: 'TEST_ACTION' });
    });
  });
});