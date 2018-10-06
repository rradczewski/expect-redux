import { loginFlow } from "./loginFlow.saga";
import { runSaga } from "redux-saga";
import Api from "./Api";

jest.mock("./Api");

describe("loginFlow - without expectRedux", () => {
  beforeEach(() => jest.resetAllMocks());

  describe("if the user provides valid credentials", () => {
    beforeEach(() => {
      // Happy path, so authorization always works
      Api.authorize.mockResolvedValue("SOME_TOKEN");
    });

    it("stores the token in the localStorage", done => {
      /// GIVEN - a user who visits the website
      let dispatchers = new Set();
      const store = {
        subscribe: cb => {
          dispatchers.add(cb);
          return () => dispatchers.remove(cb);
        },
        dispatch: jest.fn(),
        getState: () => ({})
      };
      const saga = runSaga(store, loginFlow);

      /// WHEN - the user provides valid credentials
      // Note that we have to be aware of the fact that saga could potentially
      // register more than one dispatcher
      dispatchers.forEach(dispatch =>
        dispatch({
          type: "LOGIN_REQUEST",
          user: "MY_USER",
          password: "MY_PASSWORD"
        })
      );

      expect(Api.authorize).toHaveBeenCalledWith("MY_USER", "MY_PASSWORD");

      // Can't do without setTimeout/process.nextTick now.
      setTimeout(() => {
        expect(Api.storeItem).toHaveBeenCalledWith({ token: "SOME_TOKEN" });
        expect(store.dispatch).toHaveBeenCalledWith({
          type: "LOGIN_SUCCESS",
          token: "SOME_TOKEN"
        });
        done();
      }, 0);
    });

    it("logs out the user when they issue a LOGOUT action", () => {
      /// GIVEN - a user who visits the website
      let dispatchers = new Set();
      const store = {
        subscribe: cb => {
          dispatchers.add(cb);
          return () => dispatchers.remove(cb);
        },
        dispatch: jest.fn(),
        getState: () => ({})
      };
      const saga = runSaga(store, loginFlow);
      dispatchers.forEach(dispatch =>
        dispatch({
          type: "LOGIN_REQUEST",
          user: "MY_USER",
          password: "MY_PASSWORD"
        })
      );

      /// WHEN - the user provides valid credentials
      // Note that we have to be aware of the fact that saga could potentially
      // register more than one dispatcher
      dispatchers.forEach(dispatch => dispatch({ type: "LOGOUT" }));

      expect(Api.clearItem).toHaveBeenCalledWith("token");
    });
  });

  describe("if the credentials are not valid", () => {
    beforeEach(() => {
      Api.authorize.mockRejectedValue("INVALID CREDENTIALS");
    });

    it("reports the error", () => {
      /// GIVEN - a user who visits the website
      let dispatchers = new Set();
      const store = {
        subscribe: cb => {
          dispatchers.add(cb);
          return () => dispatchers.remove(cb);
        },
        dispatch: jest.fn(),
        getState: () => ({})
      };
      const saga = runSaga(store, loginFlow);

      /// WHEN - The user provides wrong credentials
      // Note that we have to be aware of the fact that saga could potentially
      // register more than one dispatcher
      dispatchers.forEach(dispatch =>
        dispatch({
          type: "LOGIN_REQUEST",
          user: "MY_USER",
          password: "MY_WRONG_PASSWORD"
        })
      );

      /// THEN - the error is reported
      // Can't do without setTimeout/process.nextTick now.
      setTimeout(() => {
        expect(store.dispatch).toHaveBeenCalledWith({
          type: "LOGIN_ERROR",
          error: "INVALID CREDENTIALS"
        });
        done();
      }, 0);
    });

    it("clears an old token and does not store a new one", async () => {
      /// GIVEN - a user who visits the website
      let dispatchers = new Set();
      const store = {
        subscribe: cb => {
          dispatchers.add(cb);
          return () => dispatchers.remove(cb);
        },
        dispatch: jest.fn(),
        getState: () => ({})
      };
      const saga = runSaga(store, loginFlow);

      /// WHEN - The user provides wrong credentials
      // Note that we have to be aware of the fact that saga could potentially
      // register more than one dispatcher
      dispatchers.forEach(dispatch =>
        dispatch({
          type: "LOGIN_REQUEST",
          user: "MY_USER",
          password: "MY_WRONG_PASSWORD"
        })
      );

      /// THEN - the (non-existent) token isn't stored and an old token is
      // Can't do without setTimeout/process.nextTick now.
      setTimeout(() => {
        expect(Api.storeItem).not.toHaveBeenCalled();
        expect(Api.clearItem).toHaveBeenCalledWith("token");
        done();
      }, 0);
    });
  });
});
