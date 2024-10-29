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
exports.ActionMatcher = void 0;
var ramda_1 = require("ramda");
var _printTable_1 = require("./_printTable");
var _trySerialize_1 = require("./_trySerialize");
var ActionMatcher = /** @class */ (function () {
    function ActionMatcher(predicate, errorMessage, store, timeout) {
        var _this = this;
        this.predicate = predicate;
        this.errorMessage = errorMessage;
        this.store = store;
        this.timeout = timeout;
        this.innerPromise = new Promise(function (resolve, reject) {
            _this._resolve = resolve;
            _this._reject = reject;
            setTimeout(function () {
                if (_this.timeout !== false) {
                    _this.timeoutId = setTimeout(function () { return _this.onTimeout(); }, _this.timeout);
                }
                _this.store.registerMatcher(_this);
            }, 0);
        });
    }
    ActionMatcher.prototype.resolve = function () {
        this.destroy();
        this._resolve();
    };
    ActionMatcher.prototype.reject = function (e) {
        this.destroy();
        this._reject(e);
    };
    ActionMatcher.prototype.onTimeout = function () {
        var actions = this.store.actions;
        var message = "Expected action ".concat(this.errorMessage, " to be dispatched to store, but did not happen in ").concat(this.timeout, "ms.\n\nThe following actions got dispatched to the store instead (").concat(actions.length, "):\n\n").concat((0, _printTable_1.printTable)(actions), "\n");
        var error = new Error(message);
        error.stack = error.name + ": " + error.message;
        this.reject(error);
    };
    ActionMatcher.prototype.destroy = function () {
        this.store.unregisterMatcher(this);
        if (this.innerPromise)
            this.catch(function () { return undefined; });
        else {
            console.log("Unregistered innerPromise here");
        }
        if (this.timeoutId)
            clearTimeout(this.timeoutId);
    };
    ActionMatcher.prototype.test = function (action) {
        if (this.predicate(action)) {
            this.resolve();
        }
    };
    ActionMatcher.prototype.then = function (onFulfill, onReject) {
        return this.innerPromise.then(onFulfill, onReject);
    };
    ActionMatcher.prototype.catch = function (onReject) {
        return this.innerPromise.catch(onReject);
    };
    ActionMatcher.prototype.end = function (cb) {
        return this.then(function () { return cb(); }, function (error) { return cb(error); });
    };
    ActionMatcher.prototype.and = function (otherPredicate, otherErrorMessage) {
        this.destroy();
        return new ActionMatcher((0, ramda_1.allPass)([this.predicate, otherPredicate]), "".concat(this.errorMessage, " and ").concat(otherErrorMessage), this.store, this.timeout);
    };
    ActionMatcher.prototype.ofType = function (type) {
        return this.and((0, ramda_1.propEq)(type, "type"), "of type '".concat(type, "'"));
    };
    ActionMatcher.prototype.matching = function (objectOrPredicate) {
        if (typeof objectOrPredicate === "function") {
            return this.and(objectOrPredicate, "passing predicate '".concat(objectOrPredicate.toString(), "'"));
        }
        else {
            return this.and((0, ramda_1.equals)(objectOrPredicate), "equal to ".concat((0, _trySerialize_1.trySerialize)(objectOrPredicate)));
        }
    };
    ActionMatcher.prototype.asserting = function (assertion) {
        return this.and(function (action) {
            try {
                assertion(action);
                return true;
            }
            catch (e) {
                return false;
            }
        }, "passing assertion '".concat(assertion.toString(), "'"));
    };
    ActionMatcher.empty = function (store, timeout) { return new EmptyActionMatcher(store, timeout); };
    return ActionMatcher;
}());
exports.ActionMatcher = ActionMatcher;
var EmptyActionMatcher = /** @class */ (function (_super) {
    __extends(EmptyActionMatcher, _super);
    function EmptyActionMatcher(store, timeout) {
        return _super.call(this, function () { return true; }, "", store, timeout) || this;
    }
    EmptyActionMatcher.prototype.and = function (otherPredicate, otherErrorMessage) {
        this.destroy();
        return new ActionMatcher(otherPredicate, otherErrorMessage, this.store, this.timeout);
    };
    return EmptyActionMatcher;
}(ActionMatcher));
