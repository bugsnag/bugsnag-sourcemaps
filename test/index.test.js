'use strict'

const path = require('path')

afterEach(() => jest.resetModules())

test('single uploads', () => {
  let mockCalled = 0
  jest.mock('../lib/request', () => {
    return (endpoint, makePayload, onSuccess, onError) => {
      mockCalled++
      onSuccess()
    }
  })

  const upload = require('../').upload
  return upload({
    apiKey: 'API_KEY',
    sourceMap: `${__dirname}/fixtures/single/noop.min.js.map`,
    projectRoot: `${__dirname}/fixtures/single`
  }).then(() => {
    expect(mockCalled).toBe(1)
  })
})

test('multiple uploads', () => {
  let mockCalled = 0
  let mockCalledWith = []
  jest.mock('../lib/request', () => {
    return (endpoint, makePayload, onSuccess, onError) => {
      mockCalled++
      mockCalledWith.push(makePayload())
      onSuccess()
    }
  })

  const upload = require('../').upload
  return upload({
    apiKey: 'API_KEY',
    projectRoot: `${__dirname}/fixtures/multi`,
    directory: true
  }).then(() => {
    expect(mockCalled).toBe(4)

    const uploads = mockCalledWith.reduce((accum, payload) => {
      return accum.concat({
        minifiedUrl: payload.minifiedUrl,
        minifiedFile: payload.minifiedFile.path,
        sourceMap: path.basename(payload.sourceMap.path)
      })
    }, []).sort((a, b) => a.minifiedUrl > b.minifiedUrl)

    expect(uploads).toEqual([
      {
        minifiedUrl: 'app.js',
        minifiedFile: `${__dirname}/fixtures/multi/app.js`,
        sourceMap: 'app.js.map'
      },
      {
        minifiedUrl: 'services/bugsnag.js',
        minifiedFile: `${__dirname}/fixtures/multi/services/bugsnag.js`,
        sourceMap: 'bugsnag.js.map'
      },
      {
        minifiedUrl: 'services/logger.js',
        minifiedFile: `${__dirname}/fixtures/multi/services/logger.js`,
        sourceMap: 'logger.js.map'
      },
      {
        minifiedUrl: 'services/widget.js',
        minifiedFile: `${__dirname}/fixtures/multi/services/widget.js`,
        sourceMap: 'widget.js.map'
      }
    ])
  })
})
