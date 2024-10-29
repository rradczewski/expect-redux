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
exports.NotActionMatcher = void 0;
var ramda_1 = require("ramda");
var action_matcher_1 = require("./action_matcher");
var _printTable_1 = require("./_printTable");
var NotActionMatcher = /** @class */ (function (_super) {
    __extends(NotActionMatcher, _super);
    function NotActionMatcher(predicate, errorMessage, store, timeout) {
        return _super.call(this, predicate, errorMessage, store, timeout) || this;
    }
    NotActionMatcher.prototype.onTimeout = function () {
        this.resolve();
    };
    NotActionMatcher.prototype.test = function (action) {
        if (this.predicate(action)) {
            this.fail();
        }
    };
    NotActionMatcher.prototype.fail = function () {
        var actions = this.store.actions;
        var message = "Expected action ".concat(this.errorMessage, " not to be dispatched to store, but was dispatched.\n  \n  The following actions got dispatched to the store (").concat(actions.length, "):\n  \n  ").concat((0, _printTable_1.printTable)(actions), "\n");
        var error = new Error(message);
        error.stack = error.name + ": " + error.message;
        this.reject(error);
    };
    NotActionMatcher.prototype.and = function (otherPredicate, otherErrorMessage) {
        this.destroy();
        return new NotActionMatcher((0, ramda_1.allPass)([this.predicate, otherPredicate]), "".concat(this.errorMessage, " and ").concat(otherErrorMessage), this.store, this.timeout);
    };
    NotActionMatcher.empty = function (store, timeout) { return new EmptyNotActionMatcher(store, timeout); };
    return NotActionMatcher;
}(action_matcher_1.ActionMatcher));
exports.NotActionMatcher = NotActionMatcher;
var EmptyNotActionMatcher = /** @class */ (function (_super) {
    __extends(EmptyNotActionMatcher, _super);
    function EmptyNotActionMatcher(store, timeout) {
        return _super.call(this, function () { return false; }, "", store, timeout) || this;
    }
    EmptyNotActionMatcher.prototype.and = function (otherPredicate, otherErrorMessage) {
        this.store.unregisterMatcher(this);
        return new NotActionMatcher(otherPredicate, otherErrorMessage, this.store, this.timeout);
    };
    return EmptyNotActionMatcher;
}(NotActionMatcher));
