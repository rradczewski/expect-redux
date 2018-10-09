// @flow
import { allPass } from "ramda";
import { ActionMatcher } from "./action_matcher";
import { printTable } from "./_printTable";
import type { StoreWithSpy } from "./storeSpy";

class NotActionMatcher extends ActionMatcher {
  static empty: (...args: any) => ActionMatcher = (
    store: StoreWithSpy<*, *, *>,
    timeout: number
  ): NotActionMatcher => new EmptyNotActionMatcher(store, timeout);

  constructor(
    predicate: any => boolean,
    errorMessage: string,
    store: StoreWithSpy<*, *, *>,
    timeout: number
  ) {
    super(predicate, errorMessage, store, timeout);
  }

  onTimeout() {
    this.resolve();
  }

  test(action: any): void {
    if (this.predicate(action)) {
      this.fail();
    }
  }

  fail(): void {
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
    otherErrorMessage: string
  ): NotActionMatcher {
    this.destroy();

    return new NotActionMatcher(
      allPass([this.predicate, otherPredicate]),
      `${this.errorMessage} and ${otherErrorMessage}`,
      this.store,
      (this.timeout: any)
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
      (this.timeout: any)
    );
  }
}

export { NotActionMatcher };
