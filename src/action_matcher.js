// @flow
import { allPass, equals, propEq } from "ramda";
import { printTable } from "./_printTable";
import { trySerialize } from "./_trySerialize";

import type { PromiseLike } from "./_promiseLike";
import type { StoreWithSpy } from "./storeSpy";

class ActionMatcher implements PromiseLike {
  innerPromise: Promise<*>;
  store: StoreWithSpy<*, *, *>;
  resolve: Function;
  reject: Function;
  errorMessage: string;
  predicate: any => boolean;

  static empty: (...args: any) => ActionMatcher = (
    store: StoreWithSpy<*, *, *>
  ) => new EmptyActionMatcher(store);

  constructor(
    predicate: any => boolean,
    errorMessage: string,
    store: StoreWithSpy<*, *, *>
  ) {
    this.predicate = predicate;
    this.errorMessage = errorMessage;
    this.store = store;

    this.innerPromise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.store.registerMatcher(this);
    });
  }

  test(action: any): void {
    if (this.predicate(action)) {
      this.store.unregisterMatcher(this);
      this.resolve();
    }
  }

  fail(timeout: number): void {
    const actions = this.store.actions;

    const message = `Expected action ${
      this.errorMessage
    } to be dispatched to store, but did not happen in ${timeout}ms.

The following actions got dispatched to the store instead (${actions.length}):

${printTable(actions)}\n`;

    this.reject(new Error(message));
  }

  then(
    onFulfill?: (result: any) => PromiseLike | mixed,
    onReject?: (error: any) => PromiseLike | mixed
  ) {
    return this.innerPromise.then(onFulfill, onReject);
  }

  catch(onReject: (error: any) => PromiseLike | mixed) {
    return this.innerPromise.catch(onReject);
  }

  end(cb: Function) {
    return this.then(() => cb(), error => cb(error));
  }

  and(
    otherPredicate: any => boolean,
    otherErrorMessage: string
  ): ActionMatcher {
    this.store.unregisterMatcher(this);

    return new ActionMatcher(
      allPass([this.predicate, otherPredicate]),
      `${this.errorMessage} and ${otherErrorMessage}`,
      this.store
    );
  }

  ofType(type: string) {
    return this.and(propEq("type", type), `of type '${type}'`);
  }

  matching(objectOrPredicate: Object | (any => boolean)): ActionMatcher {
    if (typeof objectOrPredicate === "function") {
      return this.and(
        objectOrPredicate,
        `passing predicate '${objectOrPredicate.toString()}'`
      );
    } else {
      return this.and(
        equals(objectOrPredicate),
        `equal to ${trySerialize(objectOrPredicate)}`
      );
    }
  }

  asserting(assertion: any => any): ActionMatcher {
    return this.and(action => {
      try {
        assertion(action);
        return true;
      } catch (e) {
        return false;
      }
    }, `passing assertion '${assertion.toString()}'`);
  }
}

class EmptyActionMatcher extends ActionMatcher {
  constructor(store: StoreWithSpy<*, *, *>) {
    super(() => true, "", store);
  }

  and(
    otherPredicate: any => boolean,
    otherErrorMessage: string
  ): ActionMatcher {
    this.store.unregisterMatcher(this);
    return new ActionMatcher(otherPredicate, otherErrorMessage, this.store);
  }
}

export { ActionMatcher };

