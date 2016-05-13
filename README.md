![CI](https://travis-ci.org/rradczewski/expect-redux.svg)
![Deps](https://david-dm.org/rradczewski/expect-redux.svg) ![DevDeps](https://david-dm.org/rradczewski/expect-redux/dev-status.svg)

# expect-redux
Assertions for testing a redux store and the actions dispatched to it using [`mocha`](https://mochajs.org/) and its [`Promise`](https://mochajs.org/#asynchronous-code)-Interface with [`expect`](https://github.com/mjackson/expect) Matchers 

```sh
npm install expect-redux
```

## Example Usage

```node
import expect from 'expect';
import { expectRedux, storeSpy } from 'expect-redux';
import { createStore } from 'redux';

expect.extend(expectRedux);

describe('my action dispatcher', () => {
  it('eventually dispatches the action', () => {
    // Create store with spy as enhancer
    const store = createStore(state => state, {}, storeSpy);
    
    // Dispatch the action after declaring our expectation
    setTimeout(() => store.dispatch({type: 'MY_CUSTOM_ACTION'}), 100);
    
    return expect(store)
      .toDispatchAnAction()
      .ofType('MY_CUSTOM_ACTION');
  });
});
```

## API

You have to extend `expect` by importing `expect-redux` and then calling `expect.extend(expectRedux)`. After that, expect will have the matcher `toDispatchAnAction()`, which in turn exposes the following functions:

### `ofType(type)`

Matches by the passed `type` of an action only

### `matching(object)`

Matches an action equal to the passed `object` (using [`R.equals`](http://ramdajs.com/docs/#equals))

### `matching(predicate)`

Matches an action that satisfies the given `predicate`. predicate must be a function `action => boolean`, e.g. `R.propEq('payload', 'foobar')`

### `ofType(type).matching(predicate)`

Matches an action that both is of type `type` and satisfies the given `predicate`. Like above, predicate must be a function `action => boolean`.
