'use strict'

const path = require('path')
const concat = require('concat-stream')
const ROOT = __dirname.split(path.sep).join('/')

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
    sourceMap: `${ROOT}/fixtures/single/noop.min.js.map`,
    projectRoot: `${ROOT}/fixtures/single`
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
    projectRoot: `${ROOT}/fixtures/multi`,
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
        minifiedFile: `${ROOT}/fixtures/multi/app.js`,
        sourceMap: 'app.js.map'
      },
      {
        minifiedUrl: 'services/bugsnag.js',
        minifiedFile: `${ROOT}/fixtures/multi/services/bugsnag.js`,
        sourceMap: 'bugsnag.js.map'
      },
      {
        minifiedUrl: 'services/logger.js',
        minifiedFile: `${ROOT}/fixtures/multi/services/logger.js`,
        sourceMap: 'logger.js.map'
      },
      {
        minifiedUrl: 'services/widget.js',
        minifiedFile: `${ROOT}/fixtures/multi/services/widget.js`,
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
    return (endpoint, makePayload, onSuccess, onError) => {
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
    projectRoot: `${ROOT}/fixtures/multi-relative`,
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
    }, []).sort((a, b) => a.minifiedUrl > b.minifiedUrl)

    const orderedSourceMapContent = uploads.map(u => {
      const data = u.sourceMapData
      // bad mutating this array in an iterator but needs must
      delete u.sourceMapData
      return data
    })

    expect(uploads).toEqual([
      {
        minifiedUrl: 'lib/app.js',
        minifiedFile: `${ROOT}/fixtures/multi-relative/lib/app.js`,
        sourceMap: 'app.js.map'
      },
      {
        minifiedUrl: 'lib/services/bugsnag.js',
        minifiedFile: `${ROOT}/fixtures/multi-relative/lib/services/bugsnag.js`,
        sourceMap: 'bugsnag.js.map'
      },
      {
        minifiedUrl: 'lib/services/logger.js',
        minifiedFile: `${ROOT}/fixtures/multi-relative/lib/services/logger.js`,
        sourceMap: 'logger.js.map'
      },
      {
        minifiedUrl: 'lib/services/widget.js',
        minifiedFile: `${ROOT}/fixtures/multi-relative/lib/services/widget.js`,
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
