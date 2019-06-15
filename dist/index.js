'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ramda = require('ramda');
var sprintfJs = require('sprintf-js');

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

const trySerialize = o => {
  try {
    return JSON.stringify(o);
  } catch (e) {
    return `{ Unserializable Object: ${e} }`;
  }
};

const printTable = actions => {
  const longestMessage = actions.reduce((last, action) => Math.max(last, action.type.length), 0);

  const printAction = (_ref) => {
    let {
      type
    } = _ref,
        props = _objectWithoutProperties(_ref, ["type"]);

    return sprintfJs.sprintf(`\t%${longestMessage + 3}s\t%s`, type, trySerialize(props));
  };

  return `${sprintfJs.sprintf(`\t%${longestMessage + 3}s\t%s`, "TYPE", "PROPS")}
${actions.map(printAction).join("\n")}`;
};

class ActionMatcher {
  constructor(predicate, errorMessage, store, timeout) {
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
    this.innerPromise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
      setTimeout(() => {
        if (this.timeout !== false) {
          this.timeoutId = setTimeout(() => this.onTimeout(), this.timeout);
        }

        this.store.registerMatcher(this);
      }, 0);
    });
  }

  resolve() {
    this.destroy();

    this._resolve();
  }

  reject(e) {
    this.destroy();

    this._reject(e);
  }

  onTimeout() {
    const actions = this.store.actions;
    const message = `Expected action ${this.errorMessage} to be dispatched to store, but did not happen in ${this.timeout}ms.

The following actions got dispatched to the store instead (${actions.length}):

${printTable(actions)}\n`;
    this.reject(new Error(message));
  }

  destroy() {
    if (this.store) this.store.unregisterMatcher(this);
    if (this.innerPromise) this.catch(() => undefined);else {
      console.log("Unregistered innerPromise here");
    }
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  test(action) {
    if (this.predicate(action)) {
      this.resolve();
    }
  }

  then(onFulfill, onReject) {
    return this.innerPromise.then(onFulfill, onReject);
  }

  catch(onReject) {
    return this.innerPromise.catch(onReject);
  }

  end(cb) {
    return this.then(() => cb(), error => cb(error));
  }

  and(otherPredicate, otherErrorMessage) {
    this.destroy();
    return new ActionMatcher(ramda.allPass([this.predicate, otherPredicate]), `${this.errorMessage} and ${otherErrorMessage}`, this.store, this.timeout);
  }

  ofType(type) {
    return this.and(ramda.propEq("type", type), `of type '${type}'`);
  }

  matching(objectOrPredicate) {
    if (typeof objectOrPredicate === "function") {
      return this.and(objectOrPredicate, `passing predicate '${objectOrPredicate.toString()}'`);
    } else {
      return this.and(ramda.equals(objectOrPredicate), `equal to ${trySerialize(objectOrPredicate)}`);
    }
  }

  asserting(assertion) {
    return this.and(action => {
      try {
        assertion(action);
        return true;
      } catch (e) {
        return false;
      }
    }, `passing assertion '${assertion.toString()}'`);
  }

}

_defineProperty(ActionMatcher, "empty", (store, timeout) => new EmptyActionMatcher(store, timeout));

class EmptyActionMatcher extends ActionMatcher {
  constructor(store, timeout) {
    super(() => true, "", store, timeout);
  }

  and(otherPredicate, otherErrorMessage) {
    this.destroy();
    return new ActionMatcher(otherPredicate, otherErrorMessage, this.store, this.timeout);
  }

}

class NotActionMatcher extends ActionMatcher {
  constructor(predicate, errorMessage, store, timeout) {
    super(predicate, errorMessage, store, timeout);
  }

  onTimeout() {
    this.resolve();
  }

  test(action) {
    if (this.predicate(action)) {
      this.fail();
    }
  }

  fail() {
    const actions = this.store.actions;
    const message = `Expected action ${this.errorMessage} not to be dispatched to store, but was dispatched.
  
  The following actions got dispatched to the store (${actions.length}):
  
  ${printTable(actions)}\n`;
    this.reject(new Error(message));
  }

  and(otherPredicate, otherErrorMessage) {
    this.destroy();
    return new NotActionMatcher(ramda.allPass([this.predicate, otherPredicate]), `${this.errorMessage} and ${otherErrorMessage}`, this.store, this.timeout);
  }

}

_defineProperty(NotActionMatcher, "empty", (store, timeout) => new EmptyNotActionMatcher(store, timeout));

class EmptyNotActionMatcher extends NotActionMatcher {
  constructor(store, timeout) {
    super(() => false, "", store, timeout);
  }

  and(otherPredicate, otherErrorMessage) {
    this.store.unregisterMatcher(this);
    return new NotActionMatcher(otherPredicate, otherErrorMessage, this.store, this.timeout);
  }

}

class StateMatcher {
  constructor(predicate, errorMessage, store, timeout) {
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
    this.innerPromise = new Promise((_resolve, _reject) => {
      this._resolve = _resolve;
      this._reject = _reject;
      setTimeout(() => {
        if (this.timeout !== false) {
          this.timeoutId = setTimeout(() => this.onTimeout(), this.timeout);
        }

        this.unsubscribe = this.store.subscribe(() => this.test());
        this.test();
      }, 0);
    });
  }

  destroy() {
    if (this.innerPromise) this.catch(() => undefined);
    if (this.unsubscribe) this.unsubscribe();
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  resolve() {
    this.destroy();

    this._resolve();
  }

  reject(e) {
    this.destroy();

    this._reject(e);
  }

  onTimeout() {
    const actions = this.store.actions;
    const message = `State did not match expected state.

Expectation:
${this.errorMessage}

Actual state:
${JSON.stringify(this.store.getState(), undefined, 2)}

The following actions got dispatched to the store (${actions.length}):

${printTable(actions)}\n`;
    this.reject(new Error(message));
  }

  test() {
    if (this.predicate(this.store.getState())) {
      this.resolve();
    }
  }

  matching(expectedState) {
    this.destroy();
    return new StateMatcher(ramda.equals(expectedState), `equaling ${JSON.stringify(expectedState)}`, this.store, this.timeout);
  }

  withSubtree(selector) {
    this.destroy();
    return SelectingStateMatcher.empty(selector, this.store);
  }

  then(onFulfill, onReject) {
    return this.innerPromise.then(onFulfill, onReject);
  }

  catch(onReject) {
    return this.innerPromise.catch(onReject);
  }

  end(cb) {
    return this.then(() => cb(), error => cb(error));
  }

}

_defineProperty(StateMatcher, "empty", (store, timeout) => new StateMatcher(() => true, "", store, timeout));

class SelectingStateMatcher extends StateMatcher {
  constructor(selector, predicate, errorMessage, store, timeout) {
    super(predicate, errorMessage, store, timeout);

    _defineProperty(this, "selector", void 0);

    this.selector = selector;
  }

  matching(expectedState) {
    this.destroy();
    return new SelectingStateMatcher(this.selector, ramda.equals(expectedState), `substate equaling ${JSON.stringify(expectedState)}`, this.store, this.timeout);
  }

  withSubtree(selector) {
    this.destroy();
    return SelectingStateMatcher.empty(ramda.pipe(this.selector, selector), this.store, this.timeout);
  }

  test() {
    if (this.predicate(this.selector(this.store.getState()))) {
      this.resolve();
    }
  }

}

_defineProperty(SelectingStateMatcher, "empty", (selector, store, timeout) => new SelectingStateMatcher(selector, () => true, "", store, timeout));

const expectRedux = store => {
  const timeout = expectRedux.options.betterErrorMessagesTimeout;
  return {
    toHaveState: () => StateMatcher.empty(store),
    toDispatchAnAction: () => ActionMatcher.empty(store, timeout),
    toNotDispatchAnAction: dispatchTimeout => NotActionMatcher.empty(store, dispatchTimeout)
  };
};

/* Deprecated, use expectRedux.configure */
expectRedux.enableBetterErrorMessages = options => {
  console.warn("expectRedux.enableBetterErrorMessages is deprecated. Replace with `expectRedux.configure({ betterErrorMessagesTimeout: 100 })`");
  expectRedux.configure({
    betterErrorMessagesTimeout: typeof options.timeout === "number" ? options.timeout : false
  });
};

expectRedux.options = {
  betterErrorMessagesTimeout: false
};

expectRedux.configure = options => expectRedux.options = _objectSpread({}, expectRedux.options, options);

const storeEnhancer = nextCreateStore => (reducer, initialState, enhancer) => {
  const actions = [];
  const matchers = new Set();

  const recorder = (state, action) => {
    actions.push(action);
    matchers.forEach(matcher => matcher.test(action));
    return reducer(state, action);
  };

  const store = nextCreateStore(recorder, initialState, enhancer);

  const registerMatcher = matcher => {
    actions.forEach(action => matcher.test(action));
    matchers.add(matcher);
  };

  const unregisterMatcher = matcher => {
    matchers.delete(matcher);
  };

  return _objectSpread({}, store, {
    actions,
    registerMatcher,
    unregisterMatcher
  });
};

exports.expectRedux = expectRedux;
exports.storeSpy = storeEnhancer;
