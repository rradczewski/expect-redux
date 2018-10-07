import { createStore } from "redux";
import { storeSpy, expectRedux } from "../src/";
import { identity } from "ramda";

describe("expectRedux(store)", () => {
  const storeFactory = (reducer = identity, initialState = {}) =>
    createStore(reducer, initialState, storeSpy);

  describe("toDispatchAnAction()", () => {
    it("matching(obj)", () => {
      const store = storeFactory();
      store.dispatch({ type: "MY_TYPE", payload: 42 });
      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: "MY_TYPE", payload: 42 });
    });

    it("matching(predicate)", () => {
      const store = storeFactory();
      store.dispatch({ type: "MY_TYPE", payload: 42 });
      return expectRedux(store)
        .toDispatchAnAction()
        .matching(action => action.payload === 42);
    });

    it("asserting(assertion)", () => {
      const store = storeFactory();
      store.dispatch({ type: "MY_TYPE", payload: 42 });
      return expectRedux(store)
        .toDispatchAnAction()
        .asserting(action =>
          expect(action).toEqual({ type: "MY_TYPE", payload: 42 })
        );
    });

    it("ofType(str)", () => {
      const store = storeFactory();
      store.dispatch({ type: "MY_TYPE" });
      return expectRedux(store)
        .toDispatchAnAction()
        .ofType("MY_TYPE");
    });

    it("ofType(str).matching(obj)", () => {
      const store = storeFactory();
      store.dispatch({ type: "MY_TYPE", payload: 42 });
      return expectRedux(store)
        .toDispatchAnAction()
        .ofType("MY_TYPE")
        .matching({ type: "MY_TYPE", payload: 42 });
    });

    it("ofType(str).matching(predicate)", () => {
      const store = storeFactory();
      store.dispatch({ type: "MY_TYPE", payload: 42 });
      return expectRedux(store)
        .toDispatchAnAction()
        .ofType("MY_TYPE")
        .matching(action => action.payload === 42);
    });

    it("ofType(str).asserting(assertion)", () => {
      const store = storeFactory();
      store.dispatch({ type: "MY_TYPE", payload: 42 });
      return expectRedux(store)
        .toDispatchAnAction()
        .ofType("MY_TYPE")
        .asserting(action => expect(action).toHaveProperty("payload", 42));
    });
  });

  describe("toNotDispatchAnAction(timeout)", () => {
    it("should resolve only if a matching action is not dispatched inside timeout", () => {
      const store = storeFactory();

      return expectRedux(store)
        .toNotDispatchAnAction(100)
        .ofType("MY_TYPE");
    });

    it("should support composition of matchers", () => {
      const store = storeFactory();

      store.dispatch({ type: "MY_TYPE" });

      return expectRedux(store)
        .toNotDispatchAnAction(100)
        .ofType("MY_TYPE")
        .matching(() => false);
    });

    it("should fail if an action is dispatched that matches", () => {
      const store = storeFactory();

      store.dispatch({ type: "MY_TYPE"});

      return expectRedux(store)
        .toNotDispatchAnAction(0)
        .ofType("MY_TYPE")
        .then(() => Promise.reject('Was called'), () => Promise.resolve());
    });

    it("should fail if an action is dispatched that matches a composite", () => {
      const store = storeFactory();

      store.dispatch({ type: "MY_TYPE", foo: 'BAR'});

      return expectRedux(store)
        .toNotDispatchAnAction(0)
        .ofType("MY_TYPE")
        .matching(action => action.foo === 'BAR')
        .then(() => Promise.reject('Was called'), () => Promise.resolve());
    });
  });
});
