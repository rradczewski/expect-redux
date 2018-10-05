import { createStore } from "redux";
import { storeSpy, expectRedux } from "../src";
import { identity } from "ramda";

describe("better failure messages", () => {
  beforeEach(() => {
    expectRedux.configure({ betterErrorMessagesTimeout: 1 });
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
      expect(e.message).toMatch(
        /Expected action of type '\w+' and passing predicate '[^']+' to be dispatched to store, but did not happen in \d+ms/
      );
      expect(e.message).toMatch(
        "The following actions got dispatched to the store instead (2)"
      );
      expect(e.message).toMatch('foo\t{"value":"bla"}');
    }
  });

  it("should negate the message for toNotDispatchAnAction()", async () => {
    const store = createStore(identity, {}, storeSpy);

    store.dispatch({ type: "bar", value: "bla" });

    try {
      await expectRedux(store)
        .toNotDispatchAnAction()
        .ofType("bar");
      fail("No error thrown");
    } catch (e) {
      expect(e.message).toMatch(
        "Expected action of type 'bar' not to be dispatched to store, but was dispatched"
      );
      expect(e.message).toMatch(
        "The following actions got dispatched to the store (2)"
      );
      expect(e.message).toMatch('bar\t{"value":"bla"}');
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
    expectRedux.configure({ betterErrorMessagesTimeout: false });
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
