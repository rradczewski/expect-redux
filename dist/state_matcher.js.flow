// @flow
import { equals, pipe } from "ramda";
import { printTable } from "./_printTable";
import { trySerialize } from "./_trySerialize";

import type { PromiseLike } from "./_promiseLike";
import type { StoreWithSpy } from "./storeSpy";

class StateMatcher implements PromiseLike {
  static empty: (...args: any) => StateMatcher = (
    store: StoreWithSpy<*, *, *>,
    timeout: number | false
  ) => new StateMatcher(() => true, "", store, timeout);

  store: StoreWithSpy<*, *, *>;
  predicate: mixed => boolean;
  errorMessage: string;
  timeout: number | false;
  timeoutId: ?any;

  innerPromise: Promise<*>;
  _resolve: Function;
  _reject: Function;
  unsubscribe: Function;

  constructor(
    predicate: mixed => boolean,
    errorMessage: string,
    store: StoreWithSpy<*, *, *>,
    timeout: number | false
  ) {
    this.predicate = predicate;
    this.errorMessage = errorMessage;
    this.store = store;
    this.timeout = timeout;

    this.innerPromise = new Promise((_resolve, _reject) => {
      this._resolve = _resolve;
      this._reject = _reject;

      setTimeout(() => {
        if (this.timeout !== false) {
          this.timeoutId = setTimeout(() => this.onTimeout(), this.timeout);
        }
        this.unsubscribe = this.store.subscribe(() => this.test());
        this.test();
      }, 0);
    });
  }

  destroy() {
    if (this.innerPromise) this.catch(() => undefined);
    if (this.unsubscribe) this.unsubscribe();
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  resolve() {
    this.destroy();
    this._resolve();
  }

  reject(e?: Error) {
    this.destroy();
    this._reject(e);
  }

  onTimeout() {
    const actions = this.store.actions;

    const message = `State did not match expected state.

Expectation:
${this.errorMessage}

Actual state:
${JSON.stringify(this.store.getState(), undefined, 2) || ""}

The following actions got dispatched to the store (${actions.length}):

${printTable(actions)}\n`;

    this.reject(new Error(message));
  }

  test() {
    if (this.predicate(this.store.getState())) {
      this.resolve();
    }
  }

  matching(expectedState: mixed): StateMatcher {
    this.destroy();
    return new StateMatcher(
      equals(expectedState),
      `equaling ${JSON.stringify(expectedState) || ""}`,
      this.store,
      this.timeout
    );
  }

  withSubtree(selector: Object => mixed): StateMatcher {
    this.destroy();
    return SelectingStateMatcher.empty(selector, this.store);
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
}

class SelectingStateMatcher extends StateMatcher {
  static empty: (...args: any) => StateMatcher = (
    selector: Object => Object,
    store: StoreWithSpy<*, *, *>,
    timeout: number | false
  ) => new SelectingStateMatcher(selector, () => true, "", store, timeout);

  selector: Object => mixed;

  constructor(
    selector: Object => mixed,
    predicate: mixed => boolean,
    errorMessage: string,
    store: StoreWithSpy<*, *, *>,
    timeout: number | false
  ) {
    super(predicate, errorMessage, store, timeout);
    this.selector = selector;
  }

  matching(expectedState: mixed): StateMatcher {
    this.destroy();
    return new SelectingStateMatcher(
      this.selector,
      equals(expectedState),
      `substate equaling ${JSON.stringify(expectedState) || ""}`,
      this.store,
      this.timeout
    );
  }

  withSubtree(selector: Object => mixed): StateMatcher {
    this.destroy();
    return SelectingStateMatcher.empty(
      pipe(
        this.selector,
        selector
      ),
      this.store,
      this.timeout
    );
  }

  test() {
    if (this.predicate(this.selector(this.store.getState()))) {
      this.resolve();
    }
  }
}

export { StateMatcher };
