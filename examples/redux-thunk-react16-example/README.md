# Example React App tested with `expect-redux`

Scaffolded with [Create React App](https://github.com/facebookincubator/create-react-app).

This example app illustrates the possible applications for tests using `expect-redux`.

The app uses [`redux-thunk`](https://github.com/gaearon/redux-thunk) to illustrate the need of testing asynchronous effects. Its [`.withExtraArgument`](https://github.com/gaearon/redux-thunk#injecting-a-custom-argument) is used as a cheap dependency-injection mechanism so we can provide a fake implementation [in the effect test](src/App.t-effect.test.js).

The test [`App.t-effect.test.js`](src/App.t-effect.test.js) shows how the click of a button might trigger a cascade of things, yet we only assert the final action being dispatched to the store.

The other test, [`App.t-simple.test.js`](src/App.t-simple.test.js), illustrates how `expect-redux` can be used to wait for changes in the app and then assert the state [of redux](src/App.t-simple.test.js#L19-L31) or [of the rendered component](src/App.t-simple.test.js#L33-L45).

## Running

```shell
npm install
npm test
# npm start (tests are running, that's enough isn't it)
```
