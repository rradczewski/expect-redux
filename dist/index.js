'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var sprintfJs = require('sprintf-js');
var ramda = require('ramda');

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var betterErrorMessages = false;

var trySerialize = function trySerialize(o) {
  try {
    return JSON.stringify(o);
  } catch (e) {
    return '{ Unserializable Object: ' + e + ' }';
  }
};

var ExpectRedux = function () {
  function ExpectRedux(store) {
    _classCallCheck(this, ExpectRedux);

    this.store = store;
  }

  _createClass(ExpectRedux, [{
    key: 'buildErrorMessage',
    value: function buildErrorMessage(expectationStr) {
      var longestMessage = this.store.actions.reduce(function (last, action) {
        return Math.max(last, action.type.length);
      }, 0);

      var timeout = betterErrorMessages !== false ? betterErrorMessages.timeout : '';
      return 'Expected ' + expectationStr + ' to be dispatched to store, but did not happen in ' + timeout + 'ms.\n\nThe following actions got dispatched to the store instead (' + this.store.actions.length + '):\n' + this.store.actions.map(function (_ref) {
        var type = _ref.type,
            props = _objectWithoutProperties(_ref, ['type']);

        return sprintfJs.sprintf('\t%' + (longestMessage + 3) + 's:\t%s', type, trySerialize(props));
      }).join('\n') + '\n    ';
    }
  }, {
    key: 'expectation',
    value: function expectation(predicate, expectationStr) {
      var _this = this;

      var checkPreviouslyDispatchedActions = function checkPreviouslyDispatchedActions(resolver) {
        _this.store.actions.forEach(function (action) {
          return resolver(action);
        });
      };

      return new Promise(function (resolve, reject) {
        if (betterErrorMessages !== false) {
          setTimeout(function () {
            return reject(new Error(_this.buildErrorMessage(expectationStr)));
          }, betterErrorMessages.timeout);
        }
        var resolver = function resolver(action) {
          return predicate(action) ? resolve() : undefined;
        };

        checkPreviouslyDispatchedActions(resolver);
        _this.store.expectations.push(resolver);
      });
    }
  }, {
    key: 'toDispatchAnAction',
    value: function toDispatchAnAction() {
      var _this2 = this;

      var matchingObject = function matchingObject(obj) {
        return _this2.expectation(ramda.equals(obj), 'an action equal to ' + trySerialize(obj));
      };
      var matchingPredicate = function matchingPredicate(pred) {
        return _this2.expectation(pred, 'an action matching the predicate ' + pred.toString());
      };

      return {
        ofType: function ofType(type) {
          var promise = _this2.expectation(ramda.propEq('type', type), 'an action of type \'' + type + '\'');

          return Object.assign(promise, {
            matching: function matching(pred) {
              promise.catch(function () {
                return {};
              });

              return _this2.expectation(function (action) {
                return typeof pred === 'function' ? ramda.allPass([ramda.propEq('type', type), pred])(action) : ramda.allPass([ramda.propEq('type', type), ramda.equals(pred)])(action);
              }, 'an action of type \'' + type + '\' matching \'' + (typeof pred === 'function' ? pred.toString() : trySerialize(pred)) + '\'');
            }
          });
        },
        matching: function matching(obj) {
          return typeof obj === 'function' ? matchingPredicate(obj) : matchingObject(obj);
        }
      };
    }
  }]);

  return ExpectRedux;
}();

var Factory = function Factory(store) {
  return new ExpectRedux(store);
};
Factory.enableBetterErrorMessages = function (options) {
  betterErrorMessages = options;
};

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

exports.expectRedux = Factory;
exports.storeSpy = storeEnhancer;
