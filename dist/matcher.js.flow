// @flow
import { propEq, equals, allPass } from "ramda";
import {
  registerMatcherSymbol,
  unregisterMatcherSymbol,
  actionsSymbol
} from "./storeSpy";
import { trySerialize } from "./_trySerialize";

export const testSymbol = Symbol.for("expectredux_test");
export const errorMessageSymbol = Symbol.for("expectredux_errorMessage");
export const failSymbol = Symbol.for("expectredux_fail");
const resolveSymbol = Symbol.for("expectredux_resolve");
const rejectSymbol = Symbol.for("expectredux_reject");
const predicateSymbol = Symbol.for("expectredux_predicate");
const storeSymbol = Symbol.for("expectredux_store");

class MatcherPromise extends Promise<*> {
  static empty: (store: any) => MatcherPromise;

  static create(
    predicate: any => boolean,
    errorMessage: string,
    store: any
  ): MatcherPromise {
    let resolve, reject;
    const promise = new MatcherPromise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });

    // $FlowFixMe
    promise[storeSymbol] = store;
    // $FlowFixMe
    promise[resolveSymbol] = resolve;
    // $FlowFixMe
    promise[rejectSymbol] = reject;
    // $FlowFixMe
    promise[errorMessageSymbol] = errorMessage;
    // $FlowFixMe
    promise[predicateSymbol] = predicate;
    // $FlowFixMe
    store[registerMatcherSymbol](promise);
    return promise;
  }

  constructor(fun: any) {
    super(fun);
  }

  // $FlowFixMe
  [testSymbol](action): void {
    if (this[predicateSymbol](action)) {
      this[storeSymbol][unregisterMatcherSymbol](this);
      this[resolveSymbol]();
    }
  }

  // $FlowFixMe
  [failSymbol](timeout): void {
    const actions = this[storeSymbol][actionsSymbol];
    const longestMessage: number = actions.reduce(
      (last, action) => Math.max(last, action.type.length),
      0
    );

    this[rejectSymbol](
      new Error(`Expected ${
        this[errorMessageSymbol]
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
    // $FlowFixMe
    this[storeSymbol][unregisterMatcherSymbol](this);
    // $FlowFixMe
    this[storeSymbol][unregisterMatcherSymbol](matcherPromise);

    return MatcherPromise.create(
      // $FlowFixMe
      allPass([this[predicateSymbol], matcherPromise[predicateSymbol]]),
      // $FlowFixMe
      `${this[errorMessageSymbol]} and ${matcherPromise[errorMessageSymbol]}`,
      // $FlowFixMe
      this[storeSymbol]
    );
  }

  ofType(type: string) {
    return this.and(
      MatcherPromise.create(
        propEq("type", type),
        `of type '${type}'`,
        // $FlowFixMe
        this[storeSymbol]
      )
    );
  }

  matching(objectOrPredicate: Object | (any => boolean)) {
    if (typeof objectOrPredicate === "function") {
      return this.and(
        MatcherPromise.create(
          objectOrPredicate,
          `passing predicate '${objectOrPredicate.toString()}'`,
          // $FlowFixMe
          this[storeSymbol]
        )
      );
    } else {
      return this.and(
        MatcherPromise.create(
          equals(objectOrPredicate),
          `equal to ${trySerialize(objectOrPredicate)}`,
          // $FlowFixMe
          this[storeSymbol]
        )
      );
    }
  }

  asserting(assertion: any => any) {
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
        // $FlowFixMe
        this[storeSymbol]
      )
    );
  }
}

class EmptyMatcherPromise extends MatcherPromise {
  static create(store) {
    const promise = MatcherPromise.create(() => true, "", store);
    // $FlowFixMe
    promise.and = function(matcher) {
      // $FlowFixMe
      store[unregisterMatcherSymbol](this);
      return matcher;
    };
    return promise;
  }
}

MatcherPromise.empty = EmptyMatcherPromise.create;

export { MatcherPromise };
