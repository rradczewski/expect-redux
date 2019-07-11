"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trySerialize = function (o) {
    try {
        return JSON.stringify(o);
    }
    catch (e) {
        return "{ Unserializable Object: " + e + " }";
    }
};
