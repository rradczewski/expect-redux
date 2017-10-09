import { createStore } from 'redux';
import { storeSpy, expectRedux } from '../src';
import { identity } from 'ramda';


describe('better failure messages', () => {
  beforeEach(() => {
    expectRedux.enableBetterErrorMessages({timeout: 1});
  });

  it('should explain which action it was looking for');

  it('should report all dispatched actions in a brief format', async () => {
    const store = createStore(identity, {}, storeSpy);

    store.dispatch({type: 'foo', value: 'bla'});

    try {
      await expectRedux(store).toDispatchAnAction().ofType('bar').matching(foo => foo === true);
      fail('No error thrown');
    } catch(e) {
      expect(e.message).toContain('foo:\t{"value":"bla"}');
    }
  });

  it('should report the total number of dispatched actions');
  it('should highlight actions of the same type');

  afterEach(() => {
    expectRedux.enableBetterErrorMessages(false);
  })
});
