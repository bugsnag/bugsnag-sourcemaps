const bugsnag = require('@bugsnag/js')
const bugsnagClient = bugsnag({
  apiKey: 'YOUR_API_KEY',
  appVersion: require('../../package.json').version
})
module.exports = bugsnagClient
