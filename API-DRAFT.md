# API Draft

The API should be easy to understand.

## Concepts

- Everything should happen reactively (?!).
The Matchers should verify every dispatched action and every action dispatched in the future. 
It's up to the testing framework (e.g. mocha) to eventually timeout.
- Listening for actions either has to be implemented. 
  - through another reducer (concious injection or via an enhancer)
  - directly via an enhancer
- In any case, this should be as easy as possible, e.g. by using a decorator for a createStore function

## Working Copy

````js
expect(store).toDispatchAnAction
  .ofType([string type]) // returns Promise + patched methods
  .toMatch([object matchingAction | fun assert]) // without { type } ?; returns Promise + patched methods
  .resultingInState([object state|fun assert]) // returns Promise

expect(store)
  .toEventuallyHaveState([object state | fun assert])
```
