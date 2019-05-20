"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Widget = /** @class */ (function () {
    function Widget() {
        this.created = new Date();
        this.updated = new Date();
    }
    Widget.prototype.getCreated = function () {
        return this.created;
    };
    Widget.prototype.getUpdated = function () {
        return this.updated;
    };
    Widget.prototype.isWidget = function () {
        return true;
    };
    Widget.prototype.update = function () {
        this.updated = new Date();
    };
    return Widget;
}());
exports.default = Widget;
//# sourceMappingURL=widget.js.map