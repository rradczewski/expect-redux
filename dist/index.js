'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ramda = require('ramda');
var sprintfJs = require('sprintf-js');

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

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
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

var printTable = function printTable(actions) {
  var longestMessage = actions.reduce(function (last, action) {
    return Math.max(last, action.type.length);
  }, 0);

  var printAction = function printAction(_ref) {
    var type = _ref.type,
        props = _objectWithoutProperties(_ref, ["type"]);

    return sprintfJs.sprintf("\t%".concat(longestMessage + 3, "s\t%s"), type, trySerialize(props));
  };

  return "".concat(sprintfJs.sprintf("\t%".concat(longestMessage + 3, "s\t%s"), "TYPE", "PROPS"), "\n").concat(actions.map(printAction).join("\n"));
};

var ActionMatcher =
/*#__PURE__*/
function () {
  function ActionMatcher(predicate, errorMessage, store, timeout) {
    var _this = this;

    _classCallCheck(this, ActionMatcher);

    _defineProperty(this, "innerPromise", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "_resolve", void 0);

    _defineProperty(this, "_reject", void 0);

    _defineProperty(this, "errorMessage", void 0);

    _defineProperty(this, "predicate", void 0);

    _defineProperty(this, "timeout", void 0);

    _defineProperty(this, "timeoutId", void 0);

    this.predicate = predicate;
    this.errorMessage = errorMessage;
    this.store = store;
    this.timeout = timeout;
    this.innerPromise = new Promise(function (resolve, reject) {
      _this._resolve = resolve;
      _this._reject = reject;
      setTimeout(function () {
        if (_this.timeout !== false) {
          _this.timeoutId = setTimeout(function () {
            return _this.onTimeout();
          }, _this.timeout);
        }

        _this.store.registerMatcher(_this);
      }, 0);
    });
  }

  _createClass(ActionMatcher, [{
    key: "resolve",
    value: function resolve() {
      this.destroy();

      this._resolve();
    }
  }, {
    key: "reject",
    value: function reject(e) {
      this.destroy();

      this._reject(e);
    }
  }, {
    key: "onTimeout",
    value: function onTimeout() {
      var actions = this.store.actions;
      var message = "Expected action ".concat(this.errorMessage, " to be dispatched to store, but did not happen in ").concat(this.timeout, "ms.\n\nThe following actions got dispatched to the store instead (").concat(actions.length, "):\n\n").concat(printTable(actions), "\n");
      this.reject(new Error(message));
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.store) this.store.unregisterMatcher(this);
      if (this.innerPromise) this.catch(function () {
        return undefined;
      });else {
        console.log("Unregistered innerPromise here");
      }
      if (this.timeoutId) clearTimeout(this.timeoutId);
    }
  }, {
    key: "test",
    value: function test(action) {
      if (this.predicate(action)) {
        this.resolve();
      }
    }
  }, {
    key: "then",
    value: function then(onFulfill, onReject) {
      return this.innerPromise.then(onFulfill, onReject);
    }
  }, {
    key: "catch",
    value: function _catch(onReject) {
      return this.innerPromise.catch(onReject);
    }
  }, {
    key: "end",
    value: function end(cb) {
      return this.then(function () {
        return cb();
      }, function (error) {
        return cb(error);
      });
    }
  }, {
    key: "and",
    value: function and(otherPredicate, otherErrorMessage) {
      this.destroy();
      return new ActionMatcher(ramda.allPass([this.predicate, otherPredicate]), "".concat(this.errorMessage, " and ").concat(otherErrorMessage), this.store, this.timeout);
    }
  }, {
    key: "ofType",
    value: function ofType(type) {
      return this.and(ramda.propEq("type", type), "of type '".concat(type, "'"));
    }
  }, {
    key: "matching",
    value: function matching(objectOrPredicate) {
      if (typeof objectOrPredicate === "function") {
        return this.and(objectOrPredicate, "passing predicate '".concat(objectOrPredicate.toString(), "'"));
      } else {
        return this.and(ramda.equals(objectOrPredicate), "equal to ".concat(trySerialize(objectOrPredicate)));
      }
    }
  }, {
    key: "asserting",
    value: function asserting(assertion) {
      return this.and(function (action) {
        try {
          assertion(action);
          return true;
        } catch (e) {
          return false;
        }
      }, "passing assertion '".concat(assertion.toString(), "'"));
    }
  }]);

  return ActionMatcher;
}();

_defineProperty(ActionMatcher, "empty", function (store, timeout) {
  return new EmptyActionMatcher(store, timeout);
});

var EmptyActionMatcher =
/*#__PURE__*/
function (_ActionMatcher) {
  _inherits(EmptyActionMatcher, _ActionMatcher);

  function EmptyActionMatcher(store, timeout) {
    _classCallCheck(this, EmptyActionMatcher);

    return _possibleConstructorReturn(this, _getPrototypeOf(EmptyActionMatcher).call(this, function () {
      return true;
    }, "", store, timeout));
  }

  _createClass(EmptyActionMatcher, [{
    key: "and",
    value: function and(otherPredicate, otherErrorMessage) {
      this.destroy();
      return new ActionMatcher(otherPredicate, otherErrorMessage, this.store, this.timeout);
    }
  }]);

  return EmptyActionMatcher;
}(ActionMatcher);

var NotActionMatcher =
/*#__PURE__*/
function (_ActionMatcher) {
  _inherits(NotActionMatcher, _ActionMatcher);

  function NotActionMatcher(predicate, errorMessage, store, timeout) {
    _classCallCheck(this, NotActionMatcher);

    return _possibleConstructorReturn(this, _getPrototypeOf(NotActionMatcher).call(this, predicate, errorMessage, store, timeout));
  }

  _createClass(NotActionMatcher, [{
    key: "onTimeout",
    value: function onTimeout() {
      this.resolve();
    }
  }, {
    key: "test",
    value: function test(action) {
      if (this.predicate(action)) {
        this.fail();
      }
    }
  }, {
    key: "fail",
    value: function fail() {
      var actions = this.store.actions;
      var message = "Expected action ".concat(this.errorMessage, " not to be dispatched to store, but was dispatched.\n  \n  The following actions got dispatched to the store (").concat(actions.length, "):\n  \n  ").concat(printTable(actions), "\n");
      this.reject(new Error(message));
    }
  }, {
    key: "and",
    value: function and(otherPredicate, otherErrorMessage) {
      this.destroy();
      return new NotActionMatcher(ramda.allPass([this.predicate, otherPredicate]), "".concat(this.errorMessage, " and ").concat(otherErrorMessage), this.store, this.timeout);
    }
  }]);

  return NotActionMatcher;
}(ActionMatcher);

_defineProperty(NotActionMatcher, "empty", function (store, timeout) {
  return new EmptyNotActionMatcher(store, timeout);
});

var EmptyNotActionMatcher =
/*#__PURE__*/
function (_NotActionMatcher) {
  _inherits(EmptyNotActionMatcher, _NotActionMatcher);

  function EmptyNotActionMatcher(store, timeout) {
    _classCallCheck(this, EmptyNotActionMatcher);

    return _possibleConstructorReturn(this, _getPrototypeOf(EmptyNotActionMatcher).call(this, function () {
      return false;
    }, "", store, timeout));
  }

  _createClass(EmptyNotActionMatcher, [{
    key: "and",
    value: function and(otherPredicate, otherErrorMessage) {
      this.store.unregisterMatcher(this);
      return new NotActionMatcher(otherPredicate, otherErrorMessage, this.store, this.timeout);
    }
  }]);

  return EmptyNotActionMatcher;
}(NotActionMatcher);

var StateMatcher =
/*#__PURE__*/
function () {
  function StateMatcher(predicate, errorMessage, store, timeout) {
    var _this = this;

    _classCallCheck(this, StateMatcher);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "predicate", void 0);

    _defineProperty(this, "errorMessage", void 0);

    _defineProperty(this, "timeout", void 0);

    _defineProperty(this, "timeoutId", void 0);

    _defineProperty(this, "innerPromise", void 0);

    _defineProperty(this, "_resolve", void 0);

    _defineProperty(this, "_reject", void 0);

    _defineProperty(this, "unsubscribe", void 0);

    this.predicate = predicate;
    this.errorMessage = errorMessage;
    this.store = store;
    this.timeout = timeout;
    this.innerPromise = new Promise(function (_resolve, _reject) {
      _this._resolve = _resolve;
      _this._reject = _reject;
      setTimeout(function () {
        if (_this.timeout !== false) {
          _this.timeoutId = setTimeout(function () {
            return _this.onTimeout();
          }, _this.timeout);
        }

        _this.unsubscribe = _this.store.subscribe(function () {
          return _this.test();
        });

        _this.test();
      }, 0);
    });
  }

  _createClass(StateMatcher, [{
    key: "destroy",
    value: function destroy() {
      if (this.innerPromise) this.catch(function () {
        return undefined;
      });
      if (this.unsubscribe) this.unsubscribe();
      if (this.timeoutId) clearTimeout(this.timeoutId);
    }
  }, {
    key: "resolve",
    value: function resolve() {
      this.destroy();

      this._resolve();
    }
  }, {
    key: "reject",
    value: function reject(e) {
      this.destroy();

      this._reject(e);
    }
  }, {
    key: "onTimeout",
    value: function onTimeout() {
      var actions = this.store.actions;
      var message = "State did not match expected state.\n\nExpectation:\n".concat(this.errorMessage, "\n\nActual state:\n").concat(JSON.stringify(this.store.getState(), undefined, 2), "\n\nThe following actions got dispatched to the store (").concat(actions.length, "):\n\n").concat(printTable(actions), "\n");
      this.reject(new Error(message));
    }
  }, {
    key: "test",
    value: function test() {
      if (this.predicate(this.store.getState())) {
        this.resolve();
      }
    }
  }, {
    key: "matching",
    value: function matching(expectedState) {
      this.destroy();
      return new StateMatcher(ramda.equals(expectedState), "equaling ".concat(JSON.stringify(expectedState)), this.store, this.timeout);
    }
  }, {
    key: "withSubtree",
    value: function withSubtree(selector) {
      this.destroy();
      return SelectingStateMatcher.empty(selector, this.store);
    }
  }, {
    key: "then",
    value: function then(onFulfill, onReject) {
      return this.innerPromise.then(onFulfill, onReject);
    }
  }, {
    key: "catch",
    value: function _catch(onReject) {
      return this.innerPromise.catch(onReject);
    }
  }, {
    key: "end",
    value: function end(cb) {
      return this.then(function () {
        return cb();
      }, function (error) {
        return cb(error);
      });
    }
  }]);

  return StateMatcher;
}();

_defineProperty(StateMatcher, "empty", function (store, timeout) {
  return new StateMatcher(function () {
    return true;
  }, "", store, timeout);
});

var SelectingStateMatcher =
/*#__PURE__*/
function (_StateMatcher) {
  _inherits(SelectingStateMatcher, _StateMatcher);

  function SelectingStateMatcher(selector, predicate, errorMessage, store, timeout) {
    var _this2;

    _classCallCheck(this, SelectingStateMatcher);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(SelectingStateMatcher).call(this, predicate, errorMessage, store, timeout));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this2)), "selector", void 0);

    _this2.selector = selector;
    return _this2;
  }

  _createClass(SelectingStateMatcher, [{
    key: "matching",
    value: function matching(expectedState) {
      this.destroy();
      return new SelectingStateMatcher(this.selector, ramda.equals(expectedState), "substate equaling ".concat(JSON.stringify(expectedState)), this.store, this.timeout);
    }
  }, {
    key: "withSubtree",
    value: function withSubtree(selector) {
      this.destroy();
      return SelectingStateMatcher.empty(ramda.pipe(this.selector, selector), this.store, this.timeout);
    }
  }, {
    key: "test",
    value: function test() {
      if (this.predicate(this.selector(this.store.getState()))) {
        this.resolve();
      }
    }
  }]);

  return SelectingStateMatcher;
}(StateMatcher);

_defineProperty(SelectingStateMatcher, "empty", function (selector, store, timeout) {
  return new SelectingStateMatcher(selector, function () {
    return true;
  }, "", store, timeout);
});

var expectRedux = function expectRedux(store) {
  var timeout = expectRedux.options.betterErrorMessagesTimeout;
  return {
    toHaveState: function toHaveState() {
      return StateMatcher.empty(store);
    },
    toDispatchAnAction: function toDispatchAnAction() {
      return ActionMatcher.empty(store, timeout);
    },
    toNotDispatchAnAction: function toNotDispatchAnAction(dispatchTimeout) {
      return NotActionMatcher.empty(store, dispatchTimeout);
    }
  };
};

/* Deprecated, use expectRedux.configure */
expectRedux.enableBetterErrorMessages = function (options) {
  console.warn("expectRedux.enableBetterErrorMessages is deprecated. Replace with `expectRedux.configure({ betterErrorMessagesTimeout: 100 })`");
  expectRedux.configure({
    betterErrorMessagesTimeout: typeof options.timeout === "number" ? options.timeout : false
  });
};

expectRedux.options = {
  betterErrorMessagesTimeout: false
};

expectRedux.configure = function (options) {
  return expectRedux.options = _objectSpread({}, expectRedux.options, options);
};

var storeEnhancer = function storeEnhancer(nextCreateStore) {
  return function (reducer, initialState, enhancer) {
    var actions = [];
    var matchers = new Set();

    var recorder = function recorder(state, action) {
      actions.push(action);
      matchers.forEach(function (matcher) {
        return matcher.test(action);
      });
      return reducer(state, action);
    };

    var store = nextCreateStore(recorder, initialState, enhancer);

    var registerMatcher = function registerMatcher(matcher) {
      actions.forEach(function (action) {
        return matcher.test(action);
      });
      matchers.add(matcher);
    };

    var unregisterMatcher = function unregisterMatcher(matcher) {
      matchers.delete(matcher);
    };

    return _objectSpread({}, store, {
      actions: actions,
      registerMatcher: registerMatcher,
      unregisterMatcher: unregisterMatcher
    });
  };
};

exports.expectRedux = expectRedux;
exports.storeSpy = storeEnhancer;
