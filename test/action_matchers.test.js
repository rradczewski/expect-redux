import {
  ActionMatcher,
  testSymbol,
  errorMessageSymbol
} from "../src/action_matcher";
import {
  registerMatcherSymbol,
  unregisterMatcherSymbol
} from "../src/storeSpy";
import { assertPromiseDidNotResolve } from "./_assertPromiseDidNotResolve";

describe("ActionMatcher", () => {
  const storeForTest = () => ({
    registerMatcher: jest.fn(),
    unregisterMatcher: jest.fn(),
    actions: []
  });

  it("should unregister a matcher when it matches", () => {
    const store = storeForTest();

    const matcher = new ActionMatcher(
      action => action.attrA === "attrA",
      "attrA equals attrA",
      store,
      false
    );

    matcher.test({ attrA: "attrA" });

    expect(store.unregisterMatcher).toHaveBeenCalledWith(matcher);
  });

  describe("constructor", () => {
    it("should register the matcher with the store", done => {
      const store = storeForTest();
      const matcher = new ActionMatcher(action => true, "woop", store, false);

      setTimeout(() => {
        expect(store.registerMatcher).toHaveBeenCalledWith(matcher);
        done();
      }, 0);
    });
  });

  describe(".and(ActionMatcher)", () => {
    const dummyStore = storeForTest();

    const matcherA = new ActionMatcher(
      action => action.attrA === "attrA",
      "attrA equals attrA",
      dummyStore,
      false
    );
    const otherPredicate = action => action.attrB === "attrB";
    const otherErrorMessage = "attrB equals attrB";

    it("should only resolve if both predicates match", () => {
      const matcherBoth = matcherA.and(otherPredicate, otherErrorMessage);
      matcherBoth.test({ attrA: "attrA", attrB: "attrB" });
      return matcherBoth;
    });

    it("should not resolve if the first one does not resolve", () => {
      const matcherBoth = matcherA.and(otherPredicate, otherErrorMessage);
      matcherBoth.test({ attrA: "NOT_ATTR_A", attrB: "attrB" });
      return assertPromiseDidNotResolve(matcherBoth);
    });

    it("should not resolve if the second one does not resolve", () => {
      const matcherBoth = matcherA.and(otherPredicate, otherErrorMessage);
      matcherBoth.test({ attrA: "attrA", attrB: "NOT_ATTR_B" });
      return assertPromiseDidNotResolve(matcherBoth);
    });

    it("should concatenate the error message", () => {
      const matcherBoth = matcherA.and(otherPredicate, otherErrorMessage);
      expect(matcherBoth.errorMessage).toEqual(
        "attrA equals attrA and attrB equals attrB"
      );
    });

    it("should unregister both matchers and register the new one", done => {
      const store = {
        registerMatcher: jest.fn(),
        unregisterMatcher: jest.fn()
      };

      const matcherA = new ActionMatcher(
        action => action.attrA === "attrA",
        "attrA equals attrA",
        store,
        false
      );

      const matcherBoth = matcherA.and(otherPredicate, otherErrorMessage);

      setTimeout(() => {
        expect(store.registerMatcher).toHaveBeenCalledWith(matcherBoth);
        expect(store.unregisterMatcher).toHaveBeenCalledWith(matcherA);
        done();
      }, 0);
    });
  });
});
