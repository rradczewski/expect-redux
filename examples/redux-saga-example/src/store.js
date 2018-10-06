import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware from "redux-saga";

import { loginFlow } from "./loginFlow.saga";

export const configureStore = (storeEnhancers = []) => {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    (state, action) => state, // NOOP reducer
    compose(...[applyMiddleware(sagaMiddleware), ...storeEnhancers])
  );

  sagaMiddleware.run(loginFlow);

  return store;
};
