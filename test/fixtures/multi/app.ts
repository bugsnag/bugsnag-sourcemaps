import logger from "./services/logger"
import Widget from "./services/widget"
import bugsnagClient from "./services/bugsnag"

logger.debug('app is booting')

const widget = new Widget()
logger.debug('Created a widget', widget.getCreated())
widget.update()
logger.debug('Updated a widget', widget.getUpdated())
bugsnagClient.notify(new Error('errororor'))
