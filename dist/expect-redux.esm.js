import { propEq, equals, allPass } from 'ramda';
import 'sprintf-js';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

var trySerialize = function trySerialize(o) {
  try {
    return JSON.stringify(o);
  } catch (e) {
    return "{ Unserializable Object: ".concat(e, " }");
  }
};

var testSymbol = Symbol.for("expectredux_test");
var errorMessageSymbol = Symbol.for("expectredux_errorMessage");
var failSymbol = Symbol.for("expectredux_fail");
var resolveSymbol = Symbol.for("expectredux_resolve");
var rejectSymbol = Symbol.for("expectredux_reject");
var predicateSymbol = Symbol.for("expectredux_predicate");
var storeSymbol = Symbol.for("expectredux_store");

var MatcherPromise =
/*#__PURE__*/
function (_Promise) {
  _inherits(MatcherPromise, _Promise);

  _createClass(MatcherPromise, null, [{
    key: "create",
    value: function create(predicate, errorMessage, store) {
      var resolve, reject;
      var promise = new MatcherPromise(function (_resolve, _reject) {
        resolve = _resolve;
        reject = _reject;
      }); // $FlowFixMe

      promise[storeSymbol] = store; // $FlowFixMe

      promise[resolveSymbol] = resolve; // $FlowFixMe

      promise[rejectSymbol] = reject; // $FlowFixMe

      promise[errorMessageSymbol] = errorMessage; // $FlowFixMe

      promise[predicateSymbol] = predicate; // $FlowFixMe

      store[registerMatcherSymbol](promise);
      return promise;
    }
  }]);

  function MatcherPromise(fun) {
    _classCallCheck(this, MatcherPromise);

    return _possibleConstructorReturn(this, _getPrototypeOf(MatcherPromise).call(this, fun));
  } // $FlowFixMe


  _createClass(MatcherPromise, [{
    key: testSymbol,
    value: function value(action) {
      if (this[predicateSymbol](action)) {
        this[storeSymbol][unregisterMatcherSymbol](this);
        this[resolveSymbol]();
      }
    } // $FlowFixMe

  }, {
    key: failSymbol,
    value: function value(timeout) {
      var actions = this[storeSymbol][actionsSymbol];
      var longestMessage = actions.reduce(function (last, action) {
        return Math.max(last, action.type.length);
      }, 0);
      this[rejectSymbol](new Error("Expected ".concat(this[errorMessageSymbol], " to be dispatched to store, but did not happen in ").concat(timeout, "ms.\n\n  The following actions got dispatched to the store instead (").concat(actions.length, "):\n  ").concat(actions.map(function (_ref) {
        var type = _ref.type,
            props = _objectWithoutProperties(_ref, ["type"]);

        return sprintf("\t%".concat(longestMessage + 3, "s:\t%s"), type, trySerialize(props));
      }).join("\n"), "\n    ")));
    }
  }, {
    key: "and",
    value: function and(matcherPromise) {
      // $FlowFixMe
      this[storeSymbol][unregisterMatcherSymbol](this); // $FlowFixMe

      this[storeSymbol][unregisterMatcherSymbol](matcherPromise);
      return MatcherPromise.create( // $FlowFixMe
      allPass([this[predicateSymbol], matcherPromise[predicateSymbol]]), // $FlowFixMe
      "".concat(this[errorMessageSymbol], " and ").concat(matcherPromise[errorMessageSymbol]), // $FlowFixMe
      this[storeSymbol]);
    }
  }, {
    key: "ofType",
    value: function ofType(type) {
      return this.and(MatcherPromise.create(propEq("type", type), "of type '".concat(type, "'"), // $FlowFixMe
      this[storeSymbol]));
    }
  }, {
    key: "matching",
    value: function matching(objectOrPredicate) {
      if (typeof objectOrPredicate === "function") {
        return this.and(MatcherPromise.create(objectOrPredicate, "passing predicate '".concat(objectOrPredicate.toString(), "'"), // $FlowFixMe
        this[storeSymbol]));
      } else {
        return this.and(MatcherPromise.create(equals(objectOrPredicate), "equal to ".concat(trySerialize(objectOrPredicate)), // $FlowFixMe
        this[storeSymbol]));
      }
    }
  }, {
    key: "asserting",
    value: function asserting(assertion) {
      return this.and(MatcherPromise.create(function (action) {
        try {
          assertion(action);
          return true;
        } catch (e) {
          return false;
        }
      }, "passing assertion '".concat(assertion.toString(), "'"), // $FlowFixMe
      this[storeSymbol]));
    }
  }]);

  return MatcherPromise;
}(_wrapNativeSuper(Promise));

_defineProperty(MatcherPromise, "empty", void 0);

var EmptyMatcherPromise =
/*#__PURE__*/
function (_MatcherPromise) {
  _inherits(EmptyMatcherPromise, _MatcherPromise);

  function EmptyMatcherPromise() {
    _classCallCheck(this, EmptyMatcherPromise);

    return _possibleConstructorReturn(this, _getPrototypeOf(EmptyMatcherPromise).apply(this, arguments));
  }

  _createClass(EmptyMatcherPromise, null, [{
    key: "create",
    value: function create(store) {
      var promise = MatcherPromise.create(function () {
        return true;
      }, "", store); // $FlowFixMe

      promise.and = function (matcher) {
        // $FlowFixMe
        store[unregisterMatcherSymbol](this);
        return matcher;
      };

      return promise;
    }
  }]);

  return EmptyMatcherPromise;
}(MatcherPromise);

MatcherPromise.empty = EmptyMatcherPromise.create;

var registerMatcherSymbol = Symbol.for("expectredux_registerMatcherSymbol");
var unregisterMatcherSymbol = Symbol.for("expectredux_unregisterMatcherSymbol");
var timeoutSymbol = Symbol.for("expectredux_timeoutSymbol");
var actionsSymbol = Symbol.for("expectredux_actionsSymbol");

var storeEnhancer = function storeEnhancer(nextCreateStore) {
  return function (reducer, initialState, enhancer) {
    var _Object$assign;

    var actions = [];
    var matchers = new Set();

    var recorder = function recorder(state, action) {
      actions.push(action);
      matchers.forEach(function (matcher) {
        return matcher[testSymbol](action);
      });
      return reducer(state, action);
    };

    var store = nextCreateStore(recorder, initialState, enhancer);

    var timeout = function timeout(timeoutMs) {
      return matchers.forEach(function (matcher) {
        return matcher[failSymbol](timeoutMs);
      });
    };

    var registerMatcher = function registerMatcher(matcher) {
      actions.forEach(function (action) {
        return matcher[testSymbol](action);
      });
      matchers.add(matcher);
    };

    var unregisterMatcher = function unregisterMatcher(matcher) {
      matchers.delete(matcher);
    };

    return Object.assign({}, store, (_Object$assign = {}, _defineProperty(_Object$assign, actionsSymbol, actions), _defineProperty(_Object$assign, timeoutSymbol, timeout), _defineProperty(_Object$assign, registerMatcherSymbol, registerMatcher), _defineProperty(_Object$assign, unregisterMatcherSymbol, unregisterMatcher), _Object$assign));
  };
};

var betterErrorMessages = false;

var expectRedux = function expectRedux(store) {
  if (betterErrorMessages !== false) {
    var timeout = betterErrorMessages.timeout;
    setTimeout(function () {
      return store[timeoutSymbol](timeout);
    }, timeout);
  }

  return {
    toDispatchAnAction: function toDispatchAnAction() {
      return MatcherPromise.empty(store);
    }
  };
};

expectRedux.enableBetterErrorMessages = function (options) {
  betterErrorMessages = options;
};

export { expectRedux, storeEnhancer as storeSpy };
