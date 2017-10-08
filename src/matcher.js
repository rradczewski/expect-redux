// @flow
import type { Store } from 'redux';
import type { StoreShape, Action } from './storeSpy';

import { propEq, equals, allPass } from 'ramda';

const matchers = (store: StoreShape<*, *, *>) => {
  const expectation = (predicate): Promise<void> =>
    new Promise(resolve => {
      const resolver = action => (predicate(action) ? resolve() : undefined);

      checkPreviouslyDispatchedActions(resolver);
      store.expectations.push(resolver);
    });

  const checkPreviouslyDispatchedActions = resolver => {
    store.actions.forEach(action => resolver(action));
  };

  const matchingObject = obj => expectation(equals(obj));
  const matchingPredicate = pred => expectation(pred);

  return {
    ofType: (type: string) =>
      Object.assign((expectation(propEq('type', type)): Object), {
        matching: (pred: (Action => boolean) | string) =>
          expectation(
            action =>
              typeof pred === 'function'
                ? allPass([propEq('type', type), pred])(action)
                : allPass([propEq('type', type), equals(pred)])(action)
          )
      }),
    matching: (obj: Action => Promise<void> | Object) =>
      typeof obj === 'function' ? matchingPredicate(obj) : matchingObject(obj)
  };
};

export default (store: StoreShape<*, *, *>) => ({
  toDispatchAnAction: () => matchers(store)
});
