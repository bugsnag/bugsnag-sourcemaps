import bugsnag from '@bugsnag/js'
const bugsnagClient = bugsnag({
  apiKey: 'YOUR_API_KEY',
  appVersion: require('../../package.json').version
})
export default bugsnagClient
