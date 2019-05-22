class Widget {
  private created: Date
  private updated: Date

  constructor() {
    this.created = new Date()
    this.updated = new Date()
  }

  getCreated(): Date {
    return this.created
  }

  getUpdated(): Date {
    return this.updated
  }

  isWidget(): boolean {
    return true
  }

  update(): void {
    this.updated = new Date()
  }
}

export default Widget
