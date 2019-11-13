import { allPass, equals, propEq } from "ramda";
import { StoreWithSpy } from "./storeSpy";
import { printTable } from "./_printTable";
import { PromiseLike } from "./_promiseLike";
import { trySerialize } from "./_trySerialize";

class ActionMatcher implements PromiseLike {
  innerPromise: Promise<any>;
  store: StoreWithSpy<any, any>;
  _resolve: Function;
  _reject: Function;
  errorMessage: string;
  predicate: (action: any) => boolean;
  timeout: number | false;
  timeoutId: any;

  static empty: (...args: any) => ActionMatcher = (
    store: StoreWithSpy<any, any>,
    timeout: number | false
  ) => new EmptyActionMatcher(store, timeout);

  constructor(
    predicate: (action: any) => boolean,
    errorMessage: string,
    store: StoreWithSpy<any, any>,
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
    } to be dispatched to store, but did not happen in ${this.timeout}ms.

The following actions got dispatched to the store instead (${actions.length}):

${printTable(actions)}\n`;
    const error = new Error(message);
    error.stack = error.name+": "+error.message;
    this.reject(error);
  }

  destroy(): void {
    this.store.unregisterMatcher(this);
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
    onFulfill?: (result: any) => PromiseLike | unknown,
    onReject?: (error: any) => PromiseLike | unknown
  ) {
    return this.innerPromise.then(onFulfill, onReject);
  }

  catch(onReject: (error: any) => PromiseLike | unknown) {
    return this.innerPromise.catch(onReject);
  }

  end(cb: Function) {
    return this.then(() => cb(), error => cb(error));
  }

  and(
    otherPredicate: (action: any) => boolean,
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

  matching(
    objectOrPredicate: Object | ((action: any) => boolean)
  ): ActionMatcher {
    if (typeof objectOrPredicate === "function") {
      return this.and(
        <(action: any) => boolean>objectOrPredicate,
        `passing predicate '${objectOrPredicate.toString()}'`
      );
    } else {
      return this.and(
        equals(objectOrPredicate),
        `equal to ${trySerialize(objectOrPredicate)}`
      );
    }
  }

  asserting(assertion: (action: any) => any): ActionMatcher {
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
  constructor(store: StoreWithSpy<any, any>, timeout: number | false) {
    super(() => true, "", store, timeout);
  }

  and(
    otherPredicate: (action: any) => boolean,
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

