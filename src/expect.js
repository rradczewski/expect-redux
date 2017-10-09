// @flow
import type { Store } from 'redux';
import type { StoreShape, Action } from './storeSpy';

import { sprintf } from 'sprintf-js';
import { propEq, equals, allPass } from 'ramda';

let betterErrorMessages: false | BetterErrorMessagesOptions = false;

type BetterErrorMessagesOptions = {
  timeout: number
};

const trySerialize = (o: any): string => {
  try {
    return JSON.stringify(o);
  } catch(e) {
    return `{ Unserializable Object: ${e} }`;
  }
}

class ExpectRedux {
  store: StoreShape<*, *, *>;

  constructor(store: StoreShape<*, *, *>) {
    this.store = store;
  }

  buildErrorMessage(expectationStr: string) {
    const longestMessage: number = this.store.actions.reduce((last, action) => Math.max(last, action.type.length), 0);

    const timeout =
      betterErrorMessages !== false ? betterErrorMessages.timeout : '';
    return `Expected ${expectationStr} to be dispatched to store, but did not happen in ${timeout}ms.

The following actions got dispatched to the store instead (${this.store.actions
      .length}):
${this.store.actions
      .map(({ type, ...props }) => sprintf(`\t%${longestMessage+3}s:\t%s`, type, trySerialize(props)))
      .join('\n')}
    `;
  }

  expectation(
    predicate: Action => boolean,
    expectationStr: string
  ): Promise<void> {
    const checkPreviouslyDispatchedActions = resolver => {
      this.store.actions.forEach(action => resolver(action));
    };

    return new Promise((resolve, reject) => {
      if (betterErrorMessages !== false) {
        setTimeout(
          () => reject(new Error(this.buildErrorMessage(expectationStr))),
          betterErrorMessages.timeout
        );
      }
      const resolver = action => (predicate(action) ? resolve() : undefined);

      checkPreviouslyDispatchedActions(resolver);
      this.store.expectations.push(resolver);
    });
  }

  toDispatchAnAction() {
    const matchingObject = obj =>
      this.expectation(
        equals(obj),
        `an action equal to ${trySerialize(obj)}`
      );
    const matchingPredicate = (pred: Action => boolean) =>
      this.expectation(
        pred,
        `an action matching the predicate ${pred.toString()}`
      );

    return {
      ofType: (type: string) => {
        const promise: Promise<void> & Object = this.expectation(
          propEq('type', type),
          `an action of type '${type}'`
        );

        return Object.assign(promise, {
          matching: (pred: (Action => boolean) | string) => {
            promise.catch(() => ({}));

            return this.expectation(
              action =>
                typeof pred === 'function'
                  ? allPass([propEq('type', type), pred])(action)
                  : allPass([propEq('type', type), equals(pred)])(action),
              `an action of type '${type}' matching '${typeof pred ===
              'function'
                ? pred.toString()
                : trySerialize(pred)}'`
            );
          }
        });
      },
      matching: (obj: (Action => boolean) | Object) =>
        typeof obj === 'function' ? matchingPredicate(obj) : matchingObject(obj)
    };
  }
}

const Factory = (store: StoreShape<*, *, *>) => new ExpectRedux(store);
Factory.enableBetterErrorMessages = (
  options: false | BetterErrorMessagesOptions
) => {
  betterErrorMessages = options;
};

export default Factory;
