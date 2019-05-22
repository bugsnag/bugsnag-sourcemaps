const validateOptions = require('../options').validateOptions

describe('validateOptions', () => {
  test('requires "apiKey"/"--api-key"', () => {
    expect(() => {
      validateOptions({})
    }).toThrow('You must provide a valid API key to upload sourcemaps to Bugsnag.')
  })
  test('requires "sourceMap"/"--source-map"', () => {
    expect(() => {
      validateOptions({ apiKey: 'abbcc' })
    }).toThrow('You must provide a path to the source map you want to upload.')
  })
})
