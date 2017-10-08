import { allPass, equals, propEq } from 'ramda';

var matchers = function matchers(store) {
  var expectation = function expectation(predicate) {
    return new Promise(function (resolve) {
      var resolver = function resolver(action) {
        return predicate(action) ? resolve() : undefined;
      };

      checkPreviouslyDispatchedActions(resolver);
      store.expectations.push(resolver);
    });
  };

  var checkPreviouslyDispatchedActions = function checkPreviouslyDispatchedActions(resolver) {
    store.actions.forEach(function (action) {
      return resolver(action);
    });
  };

  var matchingObject = function matchingObject(obj) {
    return expectation(equals(obj));
  };
  var matchingPredicate = function matchingPredicate(pred) {
    return expectation(pred);
  };

  return {
    ofType: function ofType(type) {
      return Object.assign(expectation(propEq('type', type)), {
        matching: function matching(pred) {
          return expectation(function (action) {
            return typeof pred === 'function' ? allPass([propEq('type', type), pred])(action) : allPass([propEq('type', type), equals(pred)])(action);
          });
        }
      });
    },
    matching: function matching(obj) {
      return typeof obj === 'function' ? matchingPredicate(obj) : matchingObject(obj);
    }
  };
};

var matcher = (function (store) {
  return {
    toDispatchAnAction: function toDispatchAnAction() {
      return matchers(store);
    }
  };
});

var storeEnhancer = function storeEnhancer(nextCreateStore) {
  return function (reducer, initialState, enhancer) {
    var actions = [];
    var expectations = [];

    var checkExpectations = function checkExpectations(action) {
      return expectations.forEach(function (expectation) {
        return expectation(action);
      });
    };

    var recorder = function recorder(state, action) {
      actions.push(action);
      checkExpectations(action);
      return reducer(state, action);
    };

    var store = nextCreateStore(recorder, initialState, enhancer);

    return Object.assign({}, store, {
      actions: actions,
      expectations: expectations
    });
  };
};

export { matcher as expectRedux, storeEnhancer as storeSpy };
