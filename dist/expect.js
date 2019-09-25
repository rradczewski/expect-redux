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
var action_matcher_1 = require("./action_matcher");
var not_action_matcher_1 = require("./not_action_matcher");
var state_matcher_1 = require("./state_matcher");
var expectRedux = function (store) {
    var timeout = expectRedux.options.betterErrorMessagesTimeout;
    return {
        toHaveState: function () { return state_matcher_1.StateMatcher.empty(store); },
        toDispatchAnAction: function () {
            return action_matcher_1.ActionMatcher.empty(store, timeout);
        },
        toNotDispatchAnAction: function (dispatchTimeout) {
            return not_action_matcher_1.NotActionMatcher.empty(store, dispatchTimeout);
        }
    };
};
/* Deprecated, use expectRedux.configure */
expectRedux.enableBetterErrorMessages = function (options) {
    console.warn("expectRedux.enableBetterErrorMessages is deprecated. Replace with `expectRedux.configure({ betterErrorMessagesTimeout: 100 })`");
    expectRedux.configure({
        betterErrorMessagesTimeout: typeof options === "boolean"
            ? false
            : options.timeout
    });
};
expectRedux.options = { betterErrorMessagesTimeout: false };
expectRedux.configure = function (options) {
    return (expectRedux.options = __assign(__assign({}, expectRedux.options), options));
};
exports.default = expectRedux;
