import { propEq, equals, allPass } from 'ramda';

export default function() {
  const store = this.actual;

  const expectation = (predicate) => new Promise((resolve) => {
    const resolver = (action) => predicate(action) ? resolve() : undefined;

    checkPreviouslyDispatchedActions(resolver);
    store.expectations.push(resolver);
  });

  const checkPreviouslyDispatchedActions = (resolver) => {
    store.actions.forEach(action => resolver(action));
  };

  const matchingObject = (obj) => expectation(equals(obj));
  const matchingPredicate = (pred) => expectation(pred);

  return {
    ofType: type => Object.assign(expectation(propEq('type', type)), {
      matching: pred => expectation(action => 
        typeof pred === 'function' ? 
          allPass([propEq('type', type), pred])(action) :
          allPass([propEq('type', type), equals(pred)])(action)
      )
    }),
    matching: obj => typeof obj === 'function' ? matchingPredicate(obj) : matchingObject(obj)
  };
}