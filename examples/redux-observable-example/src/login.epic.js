import { combineEpics, ofType } from "redux-observable";
import { of, from } from "rxjs";
import { map, ignoreElements, catchError, mergeMap, mapTo, tap } from "rxjs/operators";
import Api from "./Api";

const loginEpic = action$ =>
  action$.pipe(
    ofType("LOGIN_REQUEST"),
    mergeMap(({ user, password }) =>
      from(Api.authorize(user, password)).pipe(
        tap(token => Api.storeItem({ token })),
        map(token => ({ type: "LOGIN_SUCCESS", token }))
      )
    ),
    catchError(error =>
      of({ type: "LOGIN_ERROR", error }).pipe(tap(_ => Api.clearItem("token")))
    )
  );

const logoutEpic = action$ =>
  action$.pipe(
    ofType("LOGOUT"),
    tap(() => Api.clearItem("token")),
    ignoreElements()
  );

export const authEpics = combineEpics(loginEpic, logoutEpic);
