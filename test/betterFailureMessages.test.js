import { createStore } from "redux";
import { storeSpy, expectRedux } from "../src";
import { identity } from "ramda";

describe("better failure messages", () => {
  beforeEach(() => {
    expectRedux.enableBetterErrorMessages({ timeout: 1 });
  });

  it("should report all dispatched actions in a brief format", async () => {
    const store = createStore(identity, {}, storeSpy);

    store.dispatch({ type: "foo", value: "bla" });

    try {
      await expectRedux(store)
        .toDispatchAnAction()
        .ofType("bar")
        .matching(foo => foo === true);
      fail("No error thrown");
    } catch (e) {
      expect(e.message).toContain('foo:\t{"value":"bla"}');
    }
  });

  it("should report the total number of dispatched actions", async () => {
    const store = createStore(identity, {}, storeSpy);

    store.dispatch({ type: "foo", value: "bla" });
    store.dispatch({ type: "foo", value: "bla" });

    try {
      await expectRedux(store)
        .toDispatchAnAction()
        .ofType("bar")
        .matching(foo => foo === true);
      fail("No error thrown");
    } catch (e) {
      expect(e.message).toContain("(3)");
    }
  });

  afterEach(() => {
    expectRedux.enableBetterErrorMessages(false);
  });

  describe("regressions", () => {
    it("should not fail while serializing circular objects", async () => {
      const actionA = { type: "FOO" };
      actionA.foo = actionA;

      const store = createStore(identity, {}, storeSpy);
      try {
        await expectRedux(store)
          .toDispatchAnAction()
          .matching(actionA);
        fail("No error thrown");
      } catch (e) {
        expect(e.message).toContain("Unserializable Object");
      }
    });
  });
});
