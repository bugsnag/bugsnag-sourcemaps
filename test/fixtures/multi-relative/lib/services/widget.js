class Widget {
  constructor() {
    this.created = new Date();
    this.updated = new Date();
  }

  getCreated() {
    return this.created;
  }

  getUpdated() {
    return this.updated;
  }

  isWidget() {
    return true;
  }

  update() {
    this.updated = new Date();
  }

}

module.exports = Widget;
//# sourceMappingURL=widget.js.map