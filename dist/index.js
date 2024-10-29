var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  expectRedux: () => expect_default,
  storeSpy: () => storeSpy_default
});
module.exports = __toCommonJS(src_exports);

// src/action_matcher.ts
var import_ramda = require("ramda");

// src/_printTable.ts
var import_sprintf_js = require("sprintf-js");

// src/_trySerialize.ts
var trySerialize = (o) => {
  try {
    return JSON.stringify(o);
  } catch (e) {
    return `{ Unserializable Object: ${e} }`;
  }
};

// src/_printTable.ts
var printTable = (actions) => {
  const longestMessage = actions.reduce(
    (last, action) => Math.max(last, action.type.length),
    0
  );
  const printAction = ({ type, ...props }) => (0, import_sprintf_js.sprintf)(`	%${longestMessage + 3}s	%s`, type, trySerialize(props));
  return `${(0, import_sprintf_js.sprintf)(`	%${longestMessage + 3}s	%s`, "TYPE", "PROPS")}
${actions.map(printAction).join("\n")}`;
};

// src/action_matcher.ts
var _ActionMatcher = class _ActionMatcher {
  constructor(predicate, errorMessage, store, timeout) {
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

${printTable(actions)}
`;
    const error = new Error(message);
    error.stack = error.name + ": " + error.message;
    this.reject(error);
  }
  destroy() {
    this.store.unregisterMatcher(this);
    if (this.innerPromise) this.catch(() => void 0);
    else {
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
    return this.then(() => cb(), (error) => cb(error));
  }
  and(otherPredicate, otherErrorMessage) {
    this.destroy();
    return new _ActionMatcher(
      (0, import_ramda.allPass)([this.predicate, otherPredicate]),
      `${this.errorMessage} and ${otherErrorMessage}`,
      this.store,
      this.timeout
    );
  }
  ofType(type) {
    return this.and((0, import_ramda.propEq)(type, "type"), `of type '${type}'`);
  }
  matching(objectOrPredicate) {
    if (typeof objectOrPredicate === "function") {
      return this.and(
        objectOrPredicate,
        `passing predicate '${objectOrPredicate.toString()}'`
      );
    } else {
      return this.and(
        (0, import_ramda.equals)(objectOrPredicate),
        `equal to ${trySerialize(objectOrPredicate)}`
      );
    }
  }
  asserting(assertion) {
    return this.and((action) => {
      try {
        assertion(action);
        return true;
      } catch (e) {
        return false;
      }
    }, `passing assertion '${assertion.toString()}'`);
  }
};
_ActionMatcher.empty = (store, timeout) => new EmptyActionMatcher(store, timeout);
var ActionMatcher = _ActionMatcher;
var EmptyActionMatcher = class extends ActionMatcher {
  constructor(store, timeout) {
    super(() => true, "", store, timeout);
  }
  and(otherPredicate, otherErrorMessage) {
    this.destroy();
    return new ActionMatcher(
      otherPredicate,
      otherErrorMessage,
      this.store,
      this.timeout
    );
  }
};

// src/not_action_matcher.ts
var import_ramda2 = require("ramda");
var _NotActionMatcher = class _NotActionMatcher extends ActionMatcher {
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
  
  ${printTable(actions)}
`;
    const error = new Error(message);
    error.stack = error.name + ": " + error.message;
    this.reject(error);
  }
  and(otherPredicate, otherErrorMessage) {
    this.destroy();
    return new _NotActionMatcher(
      (0, import_ramda2.allPass)([this.predicate, otherPredicate]),
      `${this.errorMessage} and ${otherErrorMessage}`,
      this.store,
      this.timeout
    );
  }
};
_NotActionMatcher.empty = (store, timeout) => new EmptyNotActionMatcher(store, timeout);
var NotActionMatcher = _NotActionMatcher;
var EmptyNotActionMatcher = class extends NotActionMatcher {
  constructor(store, timeout) {
    super(() => false, "", store, timeout);
  }
  and(otherPredicate, otherErrorMessage) {
    this.store.unregisterMatcher(this);
    return new NotActionMatcher(
      otherPredicate,
      otherErrorMessage,
      this.store,
      this.timeout
    );
  }
};

// src/state_matcher.ts
var import_ramda3 = require("ramda");
var _StateMatcher = class _StateMatcher {
  constructor(predicate, errorMessage, store, timeout) {
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
    if (this.innerPromise) this.catch(() => void 0);
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
${JSON.stringify(this.store.getState(), void 0, 2) || ""}

The following actions got dispatched to the store (${actions.length}):

${printTable(actions)}
`;
    const error = new Error(message);
    error.stack = error.name + ": " + error.message;
    this.reject(error);
  }
  test() {
    if (this.predicate(this.store.getState())) {
      this.resolve();
    }
  }
  matching(expectedState) {
    this.destroy();
    return new _StateMatcher(
      (0, import_ramda3.equals)(expectedState),
      `equaling ${JSON.stringify(expectedState) || ""}`,
      this.store,
      this.timeout
    );
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
    return this.then(() => cb(), (error) => cb(error));
  }
};
_StateMatcher.empty = (store, timeout) => new _StateMatcher(() => true, "", store, timeout);
var StateMatcher = _StateMatcher;
var _SelectingStateMatcher = class _SelectingStateMatcher extends StateMatcher {
  constructor(selector, predicate, errorMessage, store, timeout) {
    super(predicate, errorMessage, store, timeout);
    this.selector = selector;
  }
  matching(expectedState) {
    this.destroy();
    return new _SelectingStateMatcher(
      this.selector,
      (0, import_ramda3.equals)(expectedState),
      `substate equaling ${JSON.stringify(expectedState) || ""}`,
      this.store,
      this.timeout
    );
  }
  withSubtree(selector) {
    this.destroy();
    return _SelectingStateMatcher.empty(
      (0, import_ramda3.pipe)(
        this.selector,
        selector
      ),
      this.store,
      this.timeout
    );
  }
  test() {
    if (this.predicate(this.selector(this.store.getState()))) {
      this.resolve();
    }
  }
};
_SelectingStateMatcher.empty = (selector, store, timeout) => new _SelectingStateMatcher(selector, () => true, "", store, timeout);
var SelectingStateMatcher = _SelectingStateMatcher;

// src/expect.ts
var expectRedux = (store) => {
  const timeout = expectRedux.options.betterErrorMessagesTimeout;
  return {
    toHaveState: () => StateMatcher.empty(store),
    toDispatchAnAction: () => ActionMatcher.empty(store, timeout),
    toNotDispatchAnAction: (dispatchTimeout) => NotActionMatcher.empty(store, dispatchTimeout)
  };
};
expectRedux.enableBetterErrorMessages = (options) => {
  console.warn(
    "expectRedux.enableBetterErrorMessages is deprecated. Replace with `expectRedux.configure({ betterErrorMessagesTimeout: 100 })`"
  );
  expectRedux.configure({
    betterErrorMessagesTimeout: typeof options === "boolean" ? false : options.timeout
  });
};
expectRedux.options = { betterErrorMessagesTimeout: false };
expectRedux.configure = (options) => expectRedux.options = { ...expectRedux.options, ...options };
var expect_default = expectRedux;

// src/storeSpy.ts
var storeEnhancer = (nextCreateStore) => (reducer, initialState) => {
  const actions = [];
  const matchers = /* @__PURE__ */ new Set();
  const recorder = (state, action) => {
    actions.push(action);
    matchers.forEach((matcher) => matcher.test(action));
    return reducer(state, action);
  };
  const store = nextCreateStore(recorder, initialState);
  const registerMatcher = (matcher) => {
    actions.forEach((action) => matcher.test(action));
    matchers.add(matcher);
  };
  const unregisterMatcher = (matcher) => {
    matchers.delete(matcher);
  };
  return {
    ...store,
    actions,
    registerMatcher,
    unregisterMatcher
  };
};
var storeSpy_default = storeEnhancer;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  expectRedux,
  storeSpy
});
