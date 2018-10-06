// Taken from https://redux-saga.js.org/docs/advanced/NonBlockingCalls.html
import { fork, call, take, put } from "redux-saga/effects";
import Api from "./Api";

function* authorize(user, password) {
  try {
    const token = yield call(Api.authorize, user, password);
    yield put({ type: "LOGIN_SUCCESS", token });
    yield call(Api.storeItem, { token });
  } catch (error) {
    yield put({ type: "LOGIN_ERROR", error });
  }
}

function* loginFlow() {
  while (true) {
    const { user, password } = yield take("LOGIN_REQUEST");
    yield fork(authorize, user, password);
    yield take(["LOGOUT", "LOGIN_ERROR"]);
    yield call(Api.clearItem, "token");
  }
}

export { loginFlow };
