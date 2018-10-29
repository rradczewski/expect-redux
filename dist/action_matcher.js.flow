// @flow
import { allPass, equals, propEq } from "ramda";
import { printTable } from "./_printTable";
import { trySerialize } from "./_trySerialize";

import type { PromiseLike } from "./_promiseLike";
import type { StoreWithSpy } from "./storeSpy";

class ActionMatcher implements PromiseLike {
  innerPromise: Promise<*>;
  store: StoreWithSpy<*, *, *>;
  _resolve: Function;
  _reject: Function;
  errorMessage: string;
  predicate: any => boolean;
  timeout: number | false;
  timeoutId: ?any;

  static empty: (...args: any) => ActionMatcher = (
    store: StoreWithSpy<*, *, *>,
    timeout: number | false
  ) => new EmptyActionMatcher(store, timeout);

  constructor(
    predicate: any => boolean,
    errorMessage: string,
    store: StoreWithSpy<*, *, *>,
    timeout: number | false
  ) {
    this.predicate = predicate;
    this.errorMessage = errorMessage;
    this.store = store;
    this.timeout = timeout;

    this.innerPromise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
      setTimeout(() => {
        if (this.timeout !== false) {
          this.timeoutId = setTimeout(() => this.onTimeout(), this.timeout);
        }
        this.store.registerMatcher(this);
      }, 0);
    });
  }

  resolve() {
    this.destroy();
    this._resolve();
  }

  reject(e: Error) {
    this.destroy();
    this._reject(e);
  }

  onTimeout() {
    const actions = this.store.actions;

    const message = `Expected action ${
      this.errorMessage
    } to be dispatched to store, but did not happen in ${(this.timeout: any)}ms.

The following actions got dispatched to the store instead (${actions.length}):

${printTable(actions)}\n`;

    this.reject(new Error(message));
  }

  destroy(): void {
    if (this.store) this.store.unregisterMatcher(this);
    if (this.innerPromise) this.catch(() => undefined);
    else {
      console.log("Unregistered innerPromise here");
    }
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  test(action: any): void {
    if (this.predicate(action)) {
      this.resolve();
    }
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
    this.destroy();

    return new ActionMatcher(
      allPass([this.predicate, otherPredicate]),
      `${this.errorMessage} and ${otherErrorMessage}`,
      this.store,
      this.timeout
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
  constructor(store: StoreWithSpy<*, *, *>, timeout: number | false) {
    super(() => true, "", store, timeout);
  }

  and(
    otherPredicate: any => boolean,
    otherErrorMessage: string
  ): ActionMatcher {
    this.destroy();
    return new ActionMatcher(
      otherPredicate,
      otherErrorMessage,
      this.store,
      this.timeout
    );
  }
}

export { ActionMatcher };
