"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var storeEnhancer = function (nextCreateStore) { return function (reducer, initialState) {
    var actions = [];
    var matchers = new Set();
    var recorder = function (state, action) {
        actions.push(action);
        matchers.forEach(function (matcher) { return matcher.test(action); });
        return reducer(state, action);
    };
    var store = nextCreateStore(recorder, initialState);
    var registerMatcher = function (matcher) {
        actions.forEach(function (action) { return matcher.test(action); });
        matchers.add(matcher);
    };
    var unregisterMatcher = function (matcher) {
        matchers.delete(matcher);
    };
    return __assign({}, store, { actions: actions,
        registerMatcher: registerMatcher,
        unregisterMatcher: unregisterMatcher });
}; };
exports.default = storeEnhancer;
