import { createStore } from "redux";
import { StateMatcher } from "../src/state_matcher";

describe("StateMatcher", () => {
  it("resolves if the state already matches", () => {
    const state = { foo: "before" };

    const store = createStore(state => state, state);
    const matcher = StateMatcher.empty(store).matching({ foo: "before" });

    return matcher;
  });

  it("resolves if the state eventually matches", () => {
    const state = { foo: "before" };

    const store = createStore((state, action) => {
      if (action.type === "BE_AFTER") {
        return { foo: "after" };
      }
      return state;
    }, state);

    const matcher = StateMatcher.empty(store).matching({ foo: "after" });
    setTimeout(() => store.dispatch({ type: "BE_AFTER" }), 0);

    return matcher;
  });

  it("allows to select a subtree of the state", () => {
    const state = { foo: { bar: "before" } };

    const store = createStore((state, action) => {
      if (action.type === "BE_AFTER") {
        return { foo: { bar: "after" } };
      }
      return state;
    }, state);

    const matcher = StateMatcher.empty(store)
      .withSubtree(state => state.foo)
      .matching({ bar: "after" });

    setTimeout(() => store.dispatch({ type: "BE_AFTER" }), 0);

    return matcher;
  });
});
