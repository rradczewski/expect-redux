"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateMatcher = void 0;
var ramda_1 = require("ramda");
var _printTable_1 = require("./_printTable");
var StateMatcher = /** @class */ (function () {
    function StateMatcher(predicate, errorMessage, store, timeout) {
        var _this = this;
        this.predicate = predicate;
        this.errorMessage = errorMessage;
        this.store = store;
        this.timeout = timeout;
        this.innerPromise = new Promise(function (_resolve, _reject) {
            _this._resolve = _resolve;
            _this._reject = _reject;
            setTimeout(function () {
                if (_this.timeout !== false) {
                    _this.timeoutId = setTimeout(function () { return _this.onTimeout(); }, _this.timeout);
                }
                _this.unsubscribe = _this.store.subscribe(function () { return _this.test(); });
                _this.test();
            }, 0);
        });
    }
    StateMatcher.prototype.destroy = function () {
        if (this.innerPromise)
            this.catch(function () { return undefined; });
        if (this.unsubscribe)
            this.unsubscribe();
        if (this.timeoutId)
            clearTimeout(this.timeoutId);
    };
    StateMatcher.prototype.resolve = function () {
        this.destroy();
        this._resolve();
    };
    StateMatcher.prototype.reject = function (e) {
        this.destroy();
        this._reject(e);
    };
    StateMatcher.prototype.onTimeout = function () {
        var actions = this.store.actions;
        var message = "State did not match expected state.\n\nExpectation:\n".concat(this.errorMessage, "\n\nActual state:\n").concat(JSON.stringify(this.store.getState(), undefined, 2) || "", "\n\nThe following actions got dispatched to the store (").concat(actions.length, "):\n\n").concat((0, _printTable_1.printTable)(actions), "\n");
        var error = new Error(message);
        error.stack = error.name + ": " + error.message;
        this.reject(error);
    };
    StateMatcher.prototype.test = function () {
        if (this.predicate(this.store.getState())) {
            this.resolve();
        }
    };
    StateMatcher.prototype.matching = function (expectedState) {
        this.destroy();
        return new StateMatcher((0, ramda_1.equals)(expectedState), "equaling ".concat(JSON.stringify(expectedState) || ""), this.store, this.timeout);
    };
    StateMatcher.prototype.withSubtree = function (selector) {
        this.destroy();
        return SelectingStateMatcher.empty(selector, this.store);
    };
    StateMatcher.prototype.then = function (onFulfill, onReject) {
        return this.innerPromise.then(onFulfill, onReject);
    };
    StateMatcher.prototype.catch = function (onReject) {
        return this.innerPromise.catch(onReject);
    };
    StateMatcher.prototype.end = function (cb) {
        return this.then(function () { return cb(); }, function (error) { return cb(error); });
    };
    StateMatcher.empty = function (store, timeout) { return new StateMatcher(function () { return true; }, "", store, timeout); };
    return StateMatcher;
}());
exports.StateMatcher = StateMatcher;
var SelectingStateMatcher = /** @class */ (function (_super) {
    __extends(SelectingStateMatcher, _super);
    function SelectingStateMatcher(selector, predicate, errorMessage, store, timeout) {
        var _this = _super.call(this, predicate, errorMessage, store, timeout) || this;
        _this.selector = selector;
        return _this;
    }
    SelectingStateMatcher.prototype.matching = function (expectedState) {
        this.destroy();
        return new SelectingStateMatcher(this.selector, (0, ramda_1.equals)(expectedState), "substate equaling ".concat(JSON.stringify(expectedState) || ""), this.store, this.timeout);
    };
    SelectingStateMatcher.prototype.withSubtree = function (selector) {
        this.destroy();
        return SelectingStateMatcher.empty((0, ramda_1.pipe)(this.selector, selector), this.store, this.timeout);
    };
    SelectingStateMatcher.prototype.test = function () {
        if (this.predicate(this.selector(this.store.getState()))) {
            this.resolve();
        }
    };
    SelectingStateMatcher.empty = function (selector, store, timeout) { return new SelectingStateMatcher(selector, function () { return true; }, "", store, timeout); };
    return SelectingStateMatcher;
}(StateMatcher));
