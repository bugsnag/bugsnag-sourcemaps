"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function debug() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    console.debug.apply(console, [new Date()].concat(args));
}
exports.debug = debug;
function info() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    console.info.apply(console, [new Date()].concat(args));
}
exports.info = info;
function warn() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    console.warn.apply(console, [new Date()].concat(args));
}
exports.warn = warn;
function error() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    console.error.apply(console, [new Date()].concat(args));
}
exports.error = error;
exports.default = { debug: debug, info: info, warn: warn, error: error };
//# sourceMappingURL=logger.js.map