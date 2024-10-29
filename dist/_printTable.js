"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printTable = void 0;
var sprintf_js_1 = require("sprintf-js");
var _trySerialize_1 = require("./_trySerialize");
var printTable = function (actions) {
    var longestMessage = actions.reduce(function (last, action) { return Math.max(last, action.type.length); }, 0);
    var printAction = function (_a) {
        var type = _a.type, props = __rest(_a, ["type"]);
        return (0, sprintf_js_1.sprintf)("\t%".concat(longestMessage + 3, "s\t%s"), type, (0, _trySerialize_1.trySerialize)(props));
    };
    return "".concat((0, sprintf_js_1.sprintf)("\t%".concat(longestMessage + 3, "s\t%s"), "TYPE", "PROPS"), "\n").concat(actions.map(printAction).join("\n"));
};
exports.printTable = printTable;
