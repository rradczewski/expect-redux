import { createStore, applyMiddleware, compose } from "redux";
import { createEpicMiddleware } from "redux-observable";

import { authEpics } from "./login.epic";

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
  const epicMiddleware = createEpicMiddleware();
  const store = createStore(
    reducer,
    compose(...[applyMiddleware(epicMiddleware), ...storeEnhancers])
  );

  epicMiddleware.run(authEpics);

  return store;
};
