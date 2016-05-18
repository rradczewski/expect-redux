[![npm version](https://badge.fury.io/js/expect-redux.svg)](https://badge.fury.io/js/expect-redux)

[![CI](https://travis-ci.org/rradczewski/expect-redux.svg)](https://travis-ci.org/rradczewski/expect-redux)
[![Deps](https://david-dm.org/rradczewski/expect-redux.svg)](https://david-dm.org/rradczewski/expect-redux) [![DevDeps](https://david-dm.org/rradczewski/expect-redux/dev-status.svg)](https://david-dm.org/rradczewski/expect-redux)

# expect-redux
Assertions for testing a redux store and the actions dispatched to it using [`mocha`](https://mochajs.org/) and its [`Promise`](https://mochajs.org/#asynchronous-code)-Interface with [`expect`](https://github.com/mjackson/expect) Matchers (using `expect` is purely optional starting with `v1.0.0`). 

I developed a first rudimentary version of `expect-redux` for use in our projects at [@VaamoTech](https://twitter.com/VaamoTech) for [Vaamo](https://vaamo.de). 

## Installation

```sh
npm install expect-redux
```

## Usage

Whether you're using `expect` or not, this library relies on `mocha` waiting for the `Promise` a test returns to eventually resolve.
Sadly, `mocha` does not support custom timeout messages yet, so a failing test will usually just yield a timeout message.

### Without `expect`

```node
import { expectRedux, storeSpy } from 'expect-redux';
import { createStore } from 'redux';

describe('my action dispatcher', () => {
  it('eventually dispatches the action', () => {
    // Create store with spy as enhancer
    const store = createStore(state => state, {}, storeSpy);
    
    // Dispatch the action after declaring our expectation
    setTimeout(() => store.dispatch({type: 'MY_CUSTOM_ACTION'}), 100);
    
    return expectRedux(store)
      .toDispatchAnAction()
      .ofType('MY_CUSTOM_ACTION');
  });
});
```

### Extending `expect`

If you're using `expect`, the easiest way to make `expectRedux` available as a matcher is to extend `expect`.

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

### `toDispatchAnAction().ofType(type)`

Matches by the passed `type` of an action only

### `toDispatchAnAction().matching(object)`

Matches an action equal to the passed `object` (using [`R.equals`](http://ramdajs.com/docs/#equals))

### `toDispatchAnAction().matching(predicate)`

Matches an action that satisfies the given `predicate`. predicate must be a function `action => boolean`, e.g. `R.propEq('payload', 'foobar')`

### `toDispatchAnAction().ofType(type).matching(predicate)`

Matches an action that both is of type `type` and satisfies the given `predicate`. Like above, predicate must be a function `action => boolean`.


## Similar or related libraries

- [redux-action-assertions](https://github.com/dmitry-zaets/redux-actions-assertions)
- [redux-mock-store](https://github.com/arnaudbenard/redux-mock-store)
