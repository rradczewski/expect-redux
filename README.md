[![npm version](https://badge.fury.io/js/expect-redux.svg)](https://badge.fury.io/js/expect-redux)

[![CI](https://travis-ci.org/rradczewski/expect-redux.svg)](https://travis-ci.org/rradczewski/expect-redux)
[![Deps](https://david-dm.org/rradczewski/expect-redux.svg)](https://david-dm.org/rradczewski/expect-redux) [![DevDeps](https://david-dm.org/rradczewski/expect-redux/dev-status.svg)](https://david-dm.org/rradczewski/expect-redux)

# expect-redux
Assertions for testing a redux store and the actions dispatched to it using test runners that support returning a Promise like [`jest`](https://github.com/facebook/jest/) or [`mocha`](https://github.com/mochajs/mocha).

I developed a first rudimentary version of `expect-redux` for use in our projects at [@VaamoTech](https://twitter.com/VaamoTech) for [Vaamo](https://vaamo.de).

## Installation

```sh
npm install expect-redux
```

## Usage

See [`/example`](example/) for an example react app illustrating the purpose of this library.

This library relies on `mocha | jest` waiting for the `Promise` a test returns to eventually resolve.
Sadly, `mocha` and `jest` neither support custom timeout messages yet, so a failing test will usually just yield a timeout message. There's a workaround for that (see `betterErrorMessages`), requiring you to specify a timeout less than the test timeout specified in your test runner (see [`jest.setTimeout`](https://facebook.github.io/jest/docs/en/jest-object.html#jestsettimeouttimeout), [`jasmine.DEFAULT_TIMEOUT_INTERVAL`](https://jasmine.github.io/api/3.0/jasmine.html) or [`mocha --timeout`](https://mochajs.org/#usage)).

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

## API

### `expectRedux.enableBetterErrorMessages({timeout: number} | false)`

Fail if no expectation matched after `timeout` miliseconds. This is a workaround so you get a meaningful error message instead of a timeout error. Can go into the setup file as it's a global switch.

### `expectRedux(store).toDispatchAnAction().ofType(type)`

Matches by the passed `type` of an action only

### `expectRedux(store).toDispatchAnAction().matching(object)`

Matches an action equal to the passed `object` (using [`R.equals`](http://ramdajs.com/docs/#equals))

### `expectRedux(store).toDispatchAnAction().matching(predicate)`

Matches an action that satisfies the given `predicate`. predicate must be a function `Action => boolean`, e.g. `R.propEq('payload', 'foobar')`. Will not fail if the `predicate` returns `false`.

### `expectRedux(store).toDispatchAnAction().asserting(assertion)`

Matches an action that won't let the given `assertion` throw an exception. Assertion must be a function `Action => any`, e.g. `action => expect(action.payload).toEqual(42)`. Will not fail if the `assertion` throws.

### `expectRedux(store).toDispatchAnAction().ofType(type).matching(predicate)`

Matches an action that both is of type `type` and satisfies the given `predicate`. Like above, predicate must be a function `action => boolean`.

### `expectRedux(store).toDispatchAnAction().ofType(type).asserting(assertion)`

Matches an action that both is of type `type` and does not let the given `assertion` throw. Assertion must be a function `Action => any`, e.g. `action => expect(action.payload).toEqual(42)`. Will not fail if the `assertion` throws.

All of these are also available in the negated form `toNotDispatchAnAction()`.


## Similar or related libraries

- [redux-action-assertions](https://github.com/dmitry-zaets/redux-actions-assertions)
- [redux-mock-store](https://github.com/arnaudbenard/redux-mock-store)
