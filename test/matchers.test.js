import { propEq } from "ramda";
import { MatcherPromise, testSymbol, errorMessageSymbol } from "../src/matcher";
import {
  registerMatcherSymbol,
  unregisterMatcherSymbol
} from "../src/storeSpy";
import { assertPromiseDidNotResolve } from "./_assertPromiseDidNotResolve";

const dummyStore = {
  [registerMatcherSymbol]: () => undefined,
  [unregisterMatcherSymbol]: () => undefined
};

describe("ofType", () => {
  it("should resolve if action has the asserted type", () => {
    const promise = MatcherPromise.empty(dummyStore).ofType("WANTED_TYPE");
    promise[testSymbol]({ type: "WANTED_TYPE" });
    return promise;
  });

  it("should not resolve if the test doesn't pass", () => {
    const promise = MatcherPromise.empty(dummyStore).ofType("WANTED_TYPE");
    promise[testSymbol]({ type: "GIVEN_TYPE" });
    return assertPromiseDidNotResolve(promise);
  });

  it("should provide a meaningful error message", () => {
    const promise = MatcherPromise.empty(dummyStore).ofType("WOOP");
    expect(promise[errorMessageSymbol]).toEqual(`of type 'WOOP'`);
  });
});

describe("matching", () => {
  describe("matching(obj)", () => {
    it("should match the whole action", () => {
      const promise = MatcherPromise.empty(dummyStore).matching({
        attrA: "FOO",
        attrB: "BAR"
      });
      promise[testSymbol]({ attrA: "FOO", attrB: "BAR" });
      return promise;
    });

    it("should not resolve if the object does not match", () => {
      const promise = MatcherPromise.empty(dummyStore).matching({
        attrA: "FOO",
        attrB: "BAR"
      });
      promise[testSymbol]({ attrA: "SOMETHING ELSE", attrB: "BAR" });
      return assertPromiseDidNotResolve(promise);
    });

    it("should provide a meaningful error message", () => {
      const obj = {
        attrA: "FOO",
        attrB: "BAR"
      };
      const promise = MatcherPromise.empty(dummyStore).matching(obj);
      expect(promise[errorMessageSymbol]).toEqual(
        `equal to ${JSON.stringify(obj)}`
      );
    });
  });

  describe("matching(predicate)", () => {
    it("should match the predicate", () => {
      const promise = MatcherPromise.empty(dummyStore).matching(
        propEq("attrA", "FOO")
      );
      promise[testSymbol]({ attrA: "FOO" });
      return promise;
    });

    it("should not resolve if the predicate does not match", () => {
      const promise = MatcherPromise.empty(dummyStore).matching({
        attrA: "FOO"
      });
      promise[testSymbol](propEq("attrA", "SOMETHING ELSE"));
      return assertPromiseDidNotResolve(promise);
    });

    it("should provide a meaningful error message", () => {
      const predicate = () => true;
      const promise = MatcherPromise.empty(dummyStore).matching(predicate);
      expect(promise[errorMessageSymbol]).toEqual(
        `passing predicate '${predicate.toString()}'`
      );
    });
  });

  describe("asserting(assertion)", () => {
    it("should pass if the assertion does not throw", () => {
      const promise = MatcherPromise.empty(dummyStore).asserting(({ attrA }) =>
        expect(attrA).toEqual("FOO")
      );
      promise[testSymbol]({ attrA: "FOO" });
      return promise;
    });

    it("should not resolve if the predicate does not match", () => {
      const promise = MatcherPromise.empty(dummyStore).asserting(({ attrA }) =>
        expect(attrA).toEqual("FOO")
      );
      promise[testSymbol](propEq("attrA", "SOMETHING ELSE"));
      return assertPromiseDidNotResolve(promise);
    });

    it("should provide a meaningful error message", () => {
      const assertion = () => expect(true).toBe(false);
      const promise = MatcherPromise.empty(dummyStore).asserting(assertion);
      expect(promise[errorMessageSymbol]).toEqual(
        `passing assertion '${assertion.toString()}'`
      );
    });
  });
});
