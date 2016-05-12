import { propEq } from 'ramda';

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

  return {
    ofType: type => expectation(propEq('type', type))
  };
};