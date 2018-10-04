import { MatcherPromise, testSymbol, errorMessageSymbol } from "../src/matcher";
import {
  registerMatcherSymbol,
  unregisterMatcherSymbol
} from "../src/storeSpy";
import { assertPromiseDidNotResolve } from "./_assertPromiseDidNotResolve";

describe("MatcherPromise", () => {
  it("should unregister a matcher when it matches", () => {
    const store = {
      [registerMatcherSymbol]: jest.fn(),
      [unregisterMatcherSymbol]: jest.fn()
    };

    const matcher = MatcherPromise.create(
      action => action.attrA === "attrA",
      "attrA equals attrA",
      store
    );

    matcher[testSymbol]({ attrA: "attrA" });

    expect(store[unregisterMatcherSymbol]).toHaveBeenCalledWith(matcher);
  });

  describe("create", () => {
    it("should register the matcher with the store", () => {
      const store = { [registerMatcherSymbol]: jest.fn() };
      const matcher = MatcherPromise.create(action => true, "woop", store);
      expect(store[registerMatcherSymbol]).toHaveBeenCalledWith(matcher);
    });
  });

  describe(".and(MatcherPromise)", () => {
    const dummyStore = {
      [registerMatcherSymbol]: () => undefined,
      [unregisterMatcherSymbol]: () => undefined
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
      matcherBoth[testSymbol]({ attrA: "attrA", attrB: "attrB" });
      return matcherBoth;
    });

    it("should not resolve if the first one does not resolve", () => {
      const matcherBoth = matcherA.and(matcherB);
      matcherBoth[testSymbol]({ attrA: "NOT_ATTR_A", attrB: "attrB" });
      return assertPromiseDidNotResolve(matcherBoth);
    });

    it("should not resolve if the second one does not resolve", () => {
      const matcherBoth = matcherA.and(matcherB);
      matcherBoth[testSymbol]({ attrA: "attrA", attrB: "NOT_ATTR_B" });
      return assertPromiseDidNotResolve(matcherBoth);
    });

    it("should concatenate the error message", () => {
      const matcherBoth = matcherA.and(matcherB);
      expect(matcherBoth[errorMessageSymbol]).toEqual(
        "attrA equals attrA and attrB equals attrB"
      );
    });

    it("should unregister both matchers and register the new one", () => {
      const store = {
        [registerMatcherSymbol]: jest.fn(),
        [unregisterMatcherSymbol]: jest.fn()
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
      expect(store[registerMatcherSymbol]).toHaveBeenCalledWith(matcherBoth);
      expect(store[unregisterMatcherSymbol]).toHaveBeenCalledWith(matcherA);
      expect(store[unregisterMatcherSymbol]).toHaveBeenCalledWith(matcherB);
    });
  });
});
