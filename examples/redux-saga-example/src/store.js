import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware from "redux-saga";

import { loginFlow } from "./loginFlow.saga";

const reducer = (
  state = { isLoggedIn: false, loginError: undefined },
  action
) => {
  if (action.type === "LOGIN_SUCCESS") {
    return { ...state, isLoggedIn: true };
  }
  if (action.type === "LOGIN_ERROR") {
    return { ...state, loginError: action.error };
  }
  if (action.type === "LOGOUT") {
    return { isLoggedIn: false, loginError: undefined };
  }
  return state;
};

export const configureStore = (storeEnhancers = []) => {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    reducer,
    compose(...[applyMiddleware(sagaMiddleware), ...storeEnhancers])
  );

  sagaMiddleware.run(loginFlow);

  return store;
};
