const bugsnag = require('@bugsnag/js')
const bugsnagClient = bugsnag({ apiKey: '6eccabc796ef28a154314498f79b724e', appVersion: '1.2.3' })
module.exports = bugsnagClient
