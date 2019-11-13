import { equals, pipe } from "ramda";
import { StoreWithSpy } from "./storeSpy";
import { printTable } from "./_printTable";
import { PromiseLike } from "./_promiseLike";

class StateMatcher implements PromiseLike {
  static empty: (...args: any) => StateMatcher = (
    store: StoreWithSpy<any, any>,
    timeout: number | false
  ) => new StateMatcher(() => true, "", store, timeout);

  store: StoreWithSpy<any, any>;
  predicate: (state: unknown) => boolean;
  errorMessage: string;
  timeout: number | false;
  timeoutId: any;

  innerPromise: Promise<any>;
  _resolve: Function;
  _reject: Function;
  unsubscribe: Function;

  constructor(
    predicate: (state: unknown) => boolean,
    errorMessage: string,
    store: StoreWithSpy<any, any>,
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
    
    const error = new Error(message);
    error.stack = error.name+": "+error.message;
    this.reject(error);
  }

  test() {
    if (this.predicate(this.store.getState())) {
      this.resolve();
    }
  }

  matching(expectedState: unknown): StateMatcher {
    this.destroy();
    return new StateMatcher(
      equals(expectedState),
      `equaling ${JSON.stringify(expectedState) || ""}`,
      this.store,
      this.timeout
    );
  }

  withSubtree(selector: (state: any) => unknown): StateMatcher {
    this.destroy();
    return SelectingStateMatcher.empty(selector, this.store);
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
}

class SelectingStateMatcher extends StateMatcher {
  static empty: (...args: any) => StateMatcher = (
    selector: (state: Object) => Object,
    store: StoreWithSpy<any, any>,
    timeout: number | false
  ) => new SelectingStateMatcher(selector, () => true, "", store, timeout);

  selector: (state: Object) => unknown;

  constructor(
    selector: (state: Object) => unknown,
    predicate: (state: unknown) => boolean,
    errorMessage: string,
    store: StoreWithSpy<any, any>,
    timeout: number | false
  ) {
    super(predicate, errorMessage, store, timeout);
    this.selector = selector;
  }

  matching(expectedState: unknown): StateMatcher {
    this.destroy();
    return new SelectingStateMatcher(
      this.selector,
      equals(expectedState),
      `substate equaling ${JSON.stringify(expectedState) || ""}`,
      this.store,
      this.timeout
    );
  }

  withSubtree(selector: (state: Object) => unknown): StateMatcher {
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
