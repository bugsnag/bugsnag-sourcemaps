"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var js_1 = __importDefault(require("@bugsnag/js"));
var bugsnagClient = js_1.default({
    apiKey: 'YOUR_API_KEY',
    appVersion: require('../../package.json').version
});
exports.default = bugsnagClient;
//# sourceMappingURL=bugsnag.js.map