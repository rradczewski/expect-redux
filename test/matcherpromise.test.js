import { MatcherPromise, testSymbol, errorMessageSymbol } from "../src/matcher";
import {
  registerMatcherSymbol,
  unregisterMatcherSymbol
} from "../src/storeSpy";
import { assertPromiseDidNotResolve } from "./_assertPromiseDidNotResolve";

describe("MatcherPromise", () => {
  it("should unregister a matcher when it matches", () => {
    const store = {
      registerMatcher: jest.fn(),
      unregisterMatcher: jest.fn()
    };

    const matcher = MatcherPromise.create(
      action => action.attrA === "attrA",
      "attrA equals attrA",
      store
    );

    matcher.test({ attrA: "attrA" });

    expect(store.unregisterMatcher).toHaveBeenCalledWith(matcher);
  });

  describe("create", () => {
    it("should register the matcher with the store", () => {
      const store = { registerMatcher: jest.fn() };
      const matcher = MatcherPromise.create(action => true, "woop", store);
      expect(store.registerMatcher).toHaveBeenCalledWith(matcher);
    });
  });

  describe(".and(MatcherPromise)", () => {
    const dummyStore = {
      registerMatcher: () => undefined,
      unregisterMatcher: () => undefined
    };

    const matcherA = MatcherPromise.create(
      action => action.attrA === "attrA",
      "attrA equals attrA",
      dummyStore
    );
    const matcherB = MatcherPromise.create(
      action => action.attrB === "attrB",
      "attrB equals attrB",
      dummyStore
    );

    it("should only resolve if both predicates match", () => {
      const matcherBoth = matcherA.and(matcherB);
      matcherBoth.test({ attrA: "attrA", attrB: "attrB" });
      return matcherBoth;
    });

    it("should not resolve if the first one does not resolve", () => {
      const matcherBoth = matcherA.and(matcherB);
      matcherBoth.test({ attrA: "NOT_ATTR_A", attrB: "attrB" });
      return assertPromiseDidNotResolve(matcherBoth);
    });

    it("should not resolve if the second one does not resolve", () => {
      const matcherBoth = matcherA.and(matcherB);
      matcherBoth.test({ attrA: "attrA", attrB: "NOT_ATTR_B" });
      return assertPromiseDidNotResolve(matcherBoth);
    });

    it("should concatenate the error message", () => {
      const matcherBoth = matcherA.and(matcherB);
      expect(matcherBoth.errorMessage).toEqual(
        "attrA equals attrA and attrB equals attrB"
      );
    });

    it("should unregister both matchers and register the new one", () => {
      const store = {
        registerMatcher: jest.fn(),
        unregisterMatcher: jest.fn()
      };

      const matcherA = MatcherPromise.create(
        action => action.attrA === "attrA",
        "attrA equals attrA",
        store
      );
      const matcherB = MatcherPromise.create(
        action => action.attrB === "attrB",
        "attrB equals attrB",
        store
      );

      const matcherBoth = matcherA.and(matcherB);
      expect(store.registerMatcher).toHaveBeenCalledWith(matcherBoth);
      expect(store.unregisterMatcher).toHaveBeenCalledWith(matcherA);
      expect(store.unregisterMatcher).toHaveBeenCalledWith(matcherB);
    });
  });
});
