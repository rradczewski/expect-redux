import { propEq } from "ramda";
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

const dummyStore = {
  registerMatcher: () => undefined,
  unregisterMatcher: () => undefined
};

describe("ofType", () => {
  it("should resolve if action has the asserted type", () => {
    const promise = ActionMatcher.empty(dummyStore).ofType("WANTED_TYPE");
    promise.test({ type: "WANTED_TYPE" });
    return promise;
  });

  it("should not resolve if the test doesn't pass", () => {
    const promise = ActionMatcher.empty(dummyStore).ofType("WANTED_TYPE");
    promise.test({ type: "GIVEN_TYPE" });
    return assertPromiseDidNotResolve(promise);
  });

  it("should provide a meaningful error message", () => {
    const promise = ActionMatcher.empty(dummyStore).ofType("WOOP");
    expect(promise.errorMessage).toEqual(`of type 'WOOP'`);
  });
});

describe("matching", () => {
  describe("matching(obj)", () => {
    it("should match the whole action", () => {
      const promise = ActionMatcher.empty(dummyStore).matching({
        attrA: "FOO",
        attrB: "BAR"
      });
      promise.test({ attrA: "FOO", attrB: "BAR" });
      return promise;
    });

    it("should not resolve if the object does not match", () => {
      const promise = ActionMatcher.empty(dummyStore).matching({
        attrA: "FOO",
        attrB: "BAR"
      });
      promise.test({ attrA: "SOMETHING ELSE", attrB: "BAR" });
      return assertPromiseDidNotResolve(promise);
    });

    it("should provide a meaningful error message", () => {
      const obj = {
        attrA: "FOO",
        attrB: "BAR"
      };
      const promise = ActionMatcher.empty(dummyStore).matching(obj);
      expect(promise.errorMessage).toEqual(`equal to ${JSON.stringify(obj)}`);
    });
  });

  describe("matching(predicate)", () => {
    it("should match the predicate", () => {
      const promise = ActionMatcher.empty(dummyStore).matching(
        propEq("attrA", "FOO")
      );
      promise.test({ attrA: "FOO" });
      return promise;
    });

    it("should not resolve if the predicate does not match", () => {
      const promise = ActionMatcher.empty(dummyStore).matching({
        attrA: "FOO"
      });
      promise.test(propEq("attrA", "SOMETHING ELSE"));
      return assertPromiseDidNotResolve(promise);
    });

    it("should provide a meaningful error message", () => {
      const predicate = () => true;
      const promise = ActionMatcher.empty(dummyStore).matching(predicate);
      expect(promise.errorMessage).toEqual(
        `passing predicate '${predicate.toString()}'`
      );
    });
  });

  describe("asserting(assertion)", () => {
    it("should pass if the assertion does not throw", () => {
      const promise = ActionMatcher.empty(dummyStore).asserting(({ attrA }) =>
        expect(attrA).toEqual("FOO")
      );
      promise.test({ attrA: "FOO" });
      return promise;
    });

    it("should not resolve if the predicate does not match", () => {
      const promise = ActionMatcher.empty(dummyStore).asserting(({ attrA }) =>
        expect(attrA).toEqual("FOO")
      );
      promise.test(propEq("attrA", "SOMETHING ELSE"));
      return assertPromiseDidNotResolve(promise);
    });

    it("should provide a meaningful error message", () => {
      const assertion = () => expect(true).toBe(false);
      const promise = ActionMatcher.empty(dummyStore).asserting(assertion);
      expect(promise.errorMessage).toEqual(
        `passing assertion '${assertion.toString()}'`
      );
    });
  });
});
