// @flow
import { propEq, equals, allPass } from "ramda";
import { trySerialize } from "./_trySerialize";
import { sprintf } from "sprintf-js";

import type { StoreWithSpy } from "./storeSpy";

type Resolve = (result?: any) => mixed;
type Reject = (reason?: any) => mixed;
interface PromiseLike {
  then(
    onFulfill: null | void,
    onReject: (error: any) => PromiseLike | mixed
  ): PromiseLike;
  catch(onReject: (error: any) => PromiseLike | mixed): PromiseLike;
}

class MatcherPromise implements PromiseLike {
  innerPromise: Promise<*>;
  store: any;
  resolve: Function;
  reject: Function;
  errorMessage: string;
  predicate: any => boolean;

  static empty(store: StoreWithSpy<*, *, *>) {
    return new EmptyMatcherPromise(store);
  }

  static create(
    predicate: any => boolean,
    errorMessage: string,
    store: StoreWithSpy<*, *, *>
  ): MatcherPromise {
    return new MatcherPromise(predicate, errorMessage, store);
  }

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
    });

    store.registerMatcher(this);
  }

  test(action: any): void {
    if (this.predicate(action)) {
      this.store.unregisterMatcher(this);
      this.resolve();
    }
  }

  fail(timeout: number): void {
    const actions = this.store.actions;
    const longestMessage: number = actions.reduce(
      (last, action) => Math.max(last, action.type.length),
      0
    );

    const printAction = ({ type, ...props }) =>
      sprintf(`\t%${longestMessage + 3}s\t%s`, type, trySerialize(props));

    const message = `Expected action ${
      this.errorMessage
    } to be dispatched to store, but did not happen in ${timeout}ms.

The following actions got dispatched to the store instead (${actions.length}):

${sprintf(`\t%${longestMessage + 3}s\t%s`, 'TYPE', 'PROPS')}
${actions.map(printAction).join("\n")}\n`;

    this.reject(new Error(message));
  }

  then(onFulfill: null | void, onReject?: (error: any) => PromiseLike | mixed) {
    return this.innerPromise.then(onFulfill, onReject);
  }

  catch(onReject: (error: any) => PromiseLike | mixed) {
    return this.innerPromise.catch(onReject);
  }

  and(matcherPromise: MatcherPromise): MatcherPromise {
    this.store.unregisterMatcher(this);
    this.store.unregisterMatcher(matcherPromise);

    return MatcherPromise.create(
      allPass([this.predicate, matcherPromise.predicate]),
      `${this.errorMessage} and ${matcherPromise.errorMessage}`,
      this.store
    );
  }

  ofType(type: string) {
    return this.and(
      MatcherPromise.create(
        propEq("type", type),
        `of type '${type}'`,
        this.store
      )
    );
  }

  matching(objectOrPredicate: Object | (any => boolean)): MatcherPromise {
    if (typeof objectOrPredicate === "function") {
      return this.and(
        MatcherPromise.create(
          objectOrPredicate,
          `passing predicate '${objectOrPredicate.toString()}'`,
          this.store
        )
      );
    } else {
      return this.and(
        MatcherPromise.create(
          equals(objectOrPredicate),
          `equal to ${trySerialize(objectOrPredicate)}`,
          this.store
        )
      );
    }
  }

  asserting(assertion: any => any): MatcherPromise {
    return this.and(
      MatcherPromise.create(
        action => {
          try {
            assertion(action);
            return true;
          } catch (e) {
            return false;
          }
        },
        `passing assertion '${assertion.toString()}'`,
        this.store
      )
    );
  }
}

class EmptyMatcherPromise extends MatcherPromise {
  constructor(store: StoreWithSpy<*, *, *>) {
    super(() => true, "", store);
  }

  and(matcher: MatcherPromise): MatcherPromise {
    this.store.unregisterMatcher(this);
    return matcher;
  }
}

export { MatcherPromise };
