// @flow
import { equals, pipe } from "ramda";

import type { PromiseLike } from "./_promiseLike";
import type { StoreWithSpy } from "./storeSpy";

class StateMatcher implements PromiseLike {
  static empty: (...args: any) => StateMatcher = (
    store: StoreWithSpy<*, *, *>
  ) => new StateMatcher(() => true, store);

  store: StoreWithSpy<*, *, *>;
  predicate: mixed => boolean;

  innerPromise: Promise<*>;
  resolve: Function;
  reject: Function;
  unsubscribe: Function;

  constructor(predicate: mixed => boolean, store: StoreWithSpy<*, *, *>) {
    this.predicate = predicate;
    this.store = store;

    this.innerPromise = new Promise((_resolve, _reject) => {
      this.resolve = _resolve;
      this.reject = _reject;

      setTimeout(() => {
        this.unsubscribe = this.store.subscribe(() => this.test());
        this.test();
      }, 0);
    });
  }

  test() {
    if (this.predicate(this.store.getState())) {
      this.unsubscribe();
      this.resolve();
    }
  }

  matching(expectedState: mixed): StateMatcher {
    return new StateMatcher(equals(expectedState), this.store);
  }

  withSubtree(selector: Object => mixed): StateMatcher {
    return SelectingStateMatcher.empty(selector, this.store);
  }

  then(onFulfill: null | void, onReject?: (error: any) => PromiseLike | mixed) {
    return this.innerPromise.then(onFulfill, onReject);
  }

  catch(onReject: (error: any) => PromiseLike | mixed) {
    return this.innerPromise.catch(onReject);
  }
}

class SelectingStateMatcher extends StateMatcher {
  static empty: (...args: any) => StateMatcher = (
    selector: Object => Object,
    store: StoreWithSpy<*, *, *>
  ) => new SelectingStateMatcher(selector, () => true, store);

  selector: Object => mixed;

  constructor(
    selector: Object => mixed,
    predicate: mixed => boolean,
    store: StoreWithSpy<*, *, *>
  ) {
    super(predicate, store);
    this.selector = selector;
  }

  matching(expectedState: mixed): StateMatcher {
    return new SelectingStateMatcher(
      this.selector,
      equals(expectedState),
      this.store
    );
  }

  withSubtree(selector: Object => mixed): StateMatcher {
    return SelectingStateMatcher.empty(
      pipe(
        this.selector,
        selector
      ),
      this.store
    );
  }

  test() {
    if (this.predicate(this.selector(this.store.getState()))) {
      this.unsubscribe();
      this.resolve();
    }
  }
}

export { StateMatcher };
