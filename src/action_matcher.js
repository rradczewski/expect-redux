// @flow
import { propEq, equals, allPass } from "ramda";
import { trySerialize } from "./_trySerialize";
import { sprintf } from "sprintf-js";

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

class NotActionMatcher extends ActionMatcher {
  static empty: (...args: any) => ActionMatcher = (
    store: StoreWithSpy<*, *, *>,
    timeout: number
  ): NotActionMatcher => new EmptyNotActionMatcher(store, timeout);

  timeout: number;

  constructor(
    predicate: any => boolean,
    errorMessage: string,
    store: StoreWithSpy<*, *, *>,
    timeout: number
  ) {
    super(predicate, errorMessage, store);
    this.timeout = timeout;

    setTimeout(() => {
      this.store.unregisterMatcher(this);
      return this.resolve();
    }, timeout);
  }

  test(action: any): void {
    if (this.predicate(action)) {
      this.store.unregisterMatcher(this);
      this.fail(this.timeout);
    }
  }

  fail(timeout: number): void {
    const actions = this.store.actions;

    const message = `Expected action ${
      this.errorMessage
    } not to be dispatched to store, but was dispatched.

The following actions got dispatched to the store (${actions.length}):

${printTable(actions)}\n`;

    this.reject(new Error(message));
  }

  and(
    otherPredicate: any => boolean,
    otherErrorMessage: string,
  ): NotActionMatcher {
    this.catch(() => undefined);
    this.store.unregisterMatcher(this);

    return new NotActionMatcher(
      allPass([this.predicate, otherPredicate]),
      `${this.errorMessage} and ${otherErrorMessage}`,
      this.store,
      this.timeout
    );
  }
}

class EmptyNotActionMatcher extends NotActionMatcher {
  constructor(store: StoreWithSpy<*, *, *>, timeout: number) {
    super(() => false, "", store, timeout);
  }

  and(
    otherPredicate: any => boolean,
    otherErrorMessage: string
  ): NotActionMatcher {
    this.store.unregisterMatcher(this);

    return new NotActionMatcher(
      otherPredicate,
      otherErrorMessage,
      this.store,
      this.timeout
    );
  }
}

const printTable = actions => {
  const longestMessage: number = actions.reduce(
    (last, action) => Math.max(last, action.type.length),
    0
  );

  const printAction = ({ type, ...props }) =>
    sprintf(`\t%${longestMessage + 3}s\t%s`, type, trySerialize(props));

  return `${sprintf(`\t%${longestMessage + 3}s\t%s`, "TYPE", "PROPS")}
${actions.map(printAction).join("\n")}`;
};

export { ActionMatcher, NotActionMatcher };
