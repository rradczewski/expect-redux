"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trySerialize = void 0;
var trySerialize = function (o) {
    try {
        return JSON.stringify(o);
    }
    catch (e) {
        return "{ Unserializable Object: ".concat(e, " }");
    }
};
exports.trySerialize = trySerialize;
