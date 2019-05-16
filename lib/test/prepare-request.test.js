const prepareRequest = require('../prepare-request')

describe('prepareRequest', () => {
  test('removes options.overwrite when false', () => {
    expect(prepareRequest({ overwrite: false })).toEqual({})
  })
  test('does not remove options.overwrite when true', () => {
    expect(prepareRequest({ overwrite: true })).toEqual({ overwrite: 'true' })
  })
})
