'use strict'

const path = require('path')
const concat = require('concat-stream')

afterEach(() => jest.resetModules())

test('single uploads', () => {
  let mockCalled = 0
  jest.mock('../lib/request', () => {
    return (endpoint, makePayload, onSuccess, onError, opts) => {
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
    return (endpoint, makePayload, onSuccess, onError, opts) => {
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
    }, []).sort((a, b) => (a.minifiedUrl > b.minifiedUrl) ? 1 : -1)

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

test('multiple uploads (resolving relative source paths inside map)', () => {
  let mockCalled = 0
  let mockCalledWith = []
  const mockConcat = concat
  jest.mock('../lib/request', () => {
    return (endpoint, makePayload, onSuccess, onError, opts) => {
      mockCalled++
      const payload = makePayload()
      payload.sourceMap.pipe(mockConcat(data => {
        payload.sourceMapData = JSON.parse(data)
        mockCalledWith.push(payload)
        onSuccess()
      }))
    }
  })

  const upload = require('../').upload
  return upload({
    apiKey: 'API_KEY',
    projectRoot: `${__dirname}/fixtures/multi-relative`,
    directory: true
  }).then(() => {
    expect(mockCalled).toBe(4)

    const uploads = mockCalledWith.reduce((accum, payload) => {
      return accum.concat({
        minifiedUrl: payload.minifiedUrl,
        minifiedFile: payload.minifiedFile.path,
        sourceMap: path.basename(payload.sourceMap.path),
        sourceMapData: payload.sourceMapData
      })
    }, []).sort((a, b) => (a.minifiedUrl > b.minifiedUrl) ? 1 : -1)

    const orderedSourceMapContent = uploads.map(u => {
      const data = u.sourceMapData
      // bad mutating this array in an iterator but needs must
      delete u.sourceMapData
      return data
    })

    expect(uploads).toEqual([
      {
        minifiedUrl: 'lib/app.js',
        minifiedFile: `${__dirname}/fixtures/multi-relative/lib/app.js`,
        sourceMap: 'app.js.map'
      },
      {
        minifiedUrl: 'lib/services/bugsnag.js',
        minifiedFile: `${__dirname}/fixtures/multi-relative/lib/services/bugsnag.js`,
        sourceMap: 'bugsnag.js.map'
      },
      {
        minifiedUrl: 'lib/services/logger.js',
        minifiedFile: `${__dirname}/fixtures/multi-relative/lib/services/logger.js`,
        sourceMap: 'logger.js.map'
      },
      {
        minifiedUrl: 'lib/services/widget.js',
        minifiedFile: `${__dirname}/fixtures/multi-relative/lib/services/widget.js`,
        sourceMap: 'widget.js.map'
      }
    ])

    expect(orderedSourceMapContent.map(map => map.sources[0])).toEqual([
      'src/app.js',
      'src/services/bugsnag.js',
      'src/services/logger.js',
      'src/services/widget.js'
    ])
  })
})

test('webpack paths', () => {
  let mockCalled = 0
  let mockCalledWith = []
  const mockConcat = concat
  jest.mock('../lib/request', () => {
    return (endpoint, makePayload, onSuccess, onError, opts) => {
      mockCalled++
      const payload = makePayload()
      payload.sourceMap.pipe(mockConcat(data => {
        payload.sourceMapData = JSON.parse(data)
        mockCalledWith.push(payload)
        onSuccess()
      }))
    }
  })

  const upload = require('../').upload
  return upload({
    apiKey: 'API_KEY',
    projectRoot: `${__dirname}/fixtures/webpack`,
    sourceMap: `${__dirname}/fixtures/webpack/main.js.map`,
    minifiedFile: `${__dirname}/fixtures/webpack/main.js`,
    minifiedUrl: 'http://yeah.no/bundle.js'
  }).then(() => {
    expect(mockCalled).toBe(1)

    expect(mockCalledWith[0].sourceMapData.sources).toEqual([
      'webpack:///webpack/bootstrap',
      'webpack:///./src/index.js'
    ])
  })
})
