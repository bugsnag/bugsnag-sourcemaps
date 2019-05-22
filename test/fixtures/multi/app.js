"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = __importDefault(require("./services/logger"));
var widget_1 = __importDefault(require("./services/widget"));
var bugsnag_1 = __importDefault(require("./services/bugsnag"));
logger_1.default.debug('app is booting');
var widget = new widget_1.default();
logger_1.default.debug('Created a widget', widget.getCreated());
widget.update();
logger_1.default.debug('Updated a widget', widget.getUpdated());
bugsnag_1.default.notify(new Error('errororor'));
//# sourceMappingURL=app.js.map