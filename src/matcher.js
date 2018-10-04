// @flow
import { propEq, equals, allPass } from "ramda";
import { trySerialize } from "./_trySerialize";
import { sprintf } from "sprintf-js";

class MatcherPromise extends Promise<*> {
  store: any;
  resolve: Function;
  reject: Function;
  errorMessage: string;
  predicate: any => boolean;

  static empty: (store: any) => MatcherPromise;

  static create(
    predicate: any => boolean,
    errorMessage: string,
    store: any
  ): MatcherPromise {

    let resolve: Function, reject: Function;
    const promise = new MatcherPromise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    promise.store = store;

    // $FlowFixMe
    promise.resolve = resolve;
    // $FlowFixMe
    promise.reject = reject;
    promise.errorMessage = errorMessage;
    promise.predicate = predicate;

    store.registerMatcher(promise);
    return promise;
  }

  constructor(fun: any) {
    super(fun);
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

    this.reject(
      new Error(`Expected ${
        this.errorMessage
      } to be dispatched to store, but did not happen in ${timeout}ms.

  The following actions got dispatched to the store instead (${actions.length}):
  ${actions
    .map(({ type, ...props }) =>
      sprintf(`\t%${longestMessage + 3}s:\t%s`, type, trySerialize(props))
    )
    .join("\n")}
    `)
    );
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
  static create(store) {
    const promise = MatcherPromise.create(() => true, "", store);

    // $FlowFixMe
    promise.and = function(matcher) {
      store.unregisterMatcher(this);
      return matcher;
    };
    return promise;
  }
}

MatcherPromise.empty = EmptyMatcherPromise.create;

export { MatcherPromise };
