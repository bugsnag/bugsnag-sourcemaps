const logger = require('./services/logger')
const Widget = require('./services/widget')
const bugsnagClient = require('./services/bugsnag')

logger.debug('app is booting')

const widget = new Widget()
logger.debug('Created a widget', widget.getCreated())
widget.update()
logger.debug('Updated a widget', widget.getUpdated())
bugsnagClient.notify(new Error('errororor'))
