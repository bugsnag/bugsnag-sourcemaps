import bugsnag from '@bugsnag/js'
const bugsnagClient = bugsnag({ apiKey: 'YOUR_API_KEY', appVersion: '1.2.3' })
export default bugsnagClient
