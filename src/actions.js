export default function() {
  const store = this.actual;

  const checkPreviouslyDispatchedActions = (resolver) => {
    store.actions.forEach(action => resolver(action));
  };

  return {
    ofType(type) {
      return new Promise((resolve) => {
        const resolver = (action) => {
          if(action.type === type) {
            resolve();
          }
        };

        checkPreviouslyDispatchedActions(resolver);
        store.expectations.push(resolver);
      });
    }
  }
};