import { storeSpy, expectRedux } from "expect-redux";
import { configureStore } from "./store";
import Api from "./Api";

jest.mock("./Api");

describe("loginFlow", () => {
  beforeEach(() => jest.resetAllMocks());

  describe("if the user provides valid credentials", () => {
    beforeEach(() => {
      // Happy path, so authorization always works
      Api.authorize.mockResolvedValue("SOME_TOKEN");
    });

    it("stores the token in the localStorage", async () => {
      /// GIVEN - a user who visits the website
      // Add the storeSpy from expectRedux as a storeEnhancer
      const store = configureStore([storeSpy]);

      /// WHEN - they enter their credentials and login
      store.dispatch({
        type: "LOGIN_REQUEST",
        user: "MY_USER",
        password: "MY_CORRECT_PASSWORD"
      });

      /// THEN - The token is stored locally for other calls
      // Without waiting for LOGIN_SUCCESS, this test would need a timeout
      // We don't need to assert the state here, as it's not used at all
      // in the given example. It's more important to assert the behaviour
      // of the saga, which is driven purely by actions, not by store state.
      await expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: "LOGIN_SUCCESS", token: "SOME_TOKEN" });

      // This assertion makes sure that the username and the password is
      // correctly passed from action to Api.authorize.
      // A unit test asserting the correct fetch behaviour of Api.authorize
      // is out of scope here, it would go into ./Api.test.js
      expect(Api.authorize).toHaveBeenCalledWith(
        "MY_USER",
        "MY_CORRECT_PASSWORD"
      );

      // This is the important assertion, that our storage mechanism was called.
      // An 'Api.test.js' file would test its implementation, but it's out of
      // scope for this test.
      expect(Api.storeItem).toHaveBeenCalledWith({ token: "SOME_TOKEN" });
    });

    it("logs out the user when they issue a LOGOUT action", async () => {
      // This test only works because the call to Api.clearItem is synchronous
      // and happens right after `yield take [..., 'LOGOUT']`.
      // If it were asynchronous, we would need to wait for the LOGOUT to
      // happen, e.g. by dispatching a 'LOGOUT_SUCCESS' action

      /// GIVEN - a successfully logged in user
      const store = configureStore([storeSpy]);
      store.dispatch({
        type: "LOGIN_REQUEST",
        user: "MY_USER",
        password: "MY_PASSWORD"
      });

      /// WHEN - they log out
      store.dispatch({ type: "LOGOUT" });

      /// THEN - the storage is cleared
      expect(Api.clearItem).toHaveBeenCalledWith("token");
    });
  });

  describe("if the credentials are not valid", () => {
    beforeEach(() => {
      Api.authorize.mockRejectedValue("INVALID CREDENTIALS");
    });

    it("reports the error", () => {
      /// GIVEN - a user who visits the website
      const store = configureStore([storeSpy]);

      /// WHEN - The user provides wrong credentials
      store.dispatch({
        type: "LOGIN_REQUEST",
        user: "MY_USER",
        password: "MY_WRONG_PASSWORD"
      });

      /// THEN - the error is reported
      // Note that we don't care about other behaviour (such as not setting
      // localStorage [see below]) as this test is purely about error reporting
      // A more narrow test that asserts exactly a single outcome, instead of
      // all of it like we did above (LOGIN_SUCCESS, storeItem, authorize).
      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: "LOGIN_ERROR", error: "INVALID CREDENTIALS" });
    });

    it("clears an old token and does not store a new one", async () => {
      /// GIVEN - a user who visits the website
      const store = configureStore([storeSpy]);

      /// WHEN - The user provides wrong credentials
      store.dispatch({
        type: "LOGIN_REQUEST",
        user: "MY_USER",
        password: "MY_WRONG_PASSWORD"
      });

      /// THEN - the (non-existent) token isn't stored and an old token is
      ///        cleared.
      // Again, we need to wait for the LOGIN_ERROR action because the Api-
      // calls were asynchronous and thus not necessarily resolved the moment
      // we would check our mocks.
      await expectRedux(store)
        .toDispatchAnAction()
        .ofType("LOGIN_ERROR");

      // This is not whitebox testing the saga (we'd need to pay attention to
      // the order of invocations then), but instead it's behaviour.
      expect(Api.storeItem).not.toHaveBeenCalled();
      expect(Api.clearItem).toHaveBeenCalledWith("token");
    });
  });
});
