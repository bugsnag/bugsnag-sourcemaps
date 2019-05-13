'use strict'

/* global test, expect, beforeEach, afterEach, fail */

process.env.BUGSNAG_RETRY_INTERVAL = 100
process.env.BUGSNAG_TIMEOUT = 100

const express = require('express')
const upload = require('../').upload
const net = require('net')

describe('HTTP level tests', () => {
  beforeEach(() => createTestServer())
  afterEach(() => closeTestServer())

  test('it makes a post request to the provided endpoint', () => {
    let n = 0
    app.post('/', (req, res) => {
      n++
      res.end()
    })
    return upload({
      apiKey: 'API_KEY',
      endpoint: `http://localhost:${server.address().port}`,
      sourceMap: `${__dirname}/fixtures/noop.min.js.map`
    }).then(() => {
      expect(n).toBe(1)
    })
  })

  test('it retries upon 50x failure', () => {
    let n = 0
    app.post('/', (req, res) => {
      n++
      if (n < 5) return res.sendStatus(500)
      return res.sendStatus(200)
    })
    return upload({
      apiKey: 'API_KEY',
      endpoint: `http://localhost:${server.address().port}`,
      sourceMap: `${__dirname}/fixtures/noop.min.js.map`
    }).then(() => {
      expect(n).toBe(5)
    })
  })

  test('it retries upon socket hangup', () => {
    let n = 0
    app.post('/', (req, res) => {
      n++
      if (n < 5) return req.connection.destroy()
      return res.sendStatus(200)
    })
    return upload({
      apiKey: 'API_KEY',
      endpoint: `http://localhost:${server.address().port}`,
      sourceMap: `${__dirname}/fixtures/noop.min.js.map`
    }).then(() => {
      expect(n).toBe(5)
    })
  })

  test('it eventually gives up retrying', () => {
    let n = 0
    app.post('/', (req, res) => {
      n++
      return res.sendStatus(500)
    })
    return upload({
      apiKey: 'API_KEY',
      endpoint: `http://localhost:${server.address().port}`,
      sourceMap: `${__dirname}/fixtures/noop.min.js.map`
    }).then(() => {
      fail(new Error('expected promise to be rejected'))
    }).catch(err => {
      expect(n).toBe(5)
      expect(err).toBeTruthy()
    })
  })

  test('it doesn’t retry on a 40x failure', () => {
    let n = 0
    app.post('/', (req, res) => {
      n++
      return res.sendStatus(400)
    })
    return upload({
      apiKey: 'API_KEY',
      endpoint: `http://localhost:${server.address().port}`,
      sourceMap: `${__dirname}/fixtures/noop.min.js.map`
    }).then(() => {
      fail(new Error('expected promise to be rejected'))
    }).catch(err => {
      expect(err).toBeTruthy()
      expect(n).toBe(1)
    })
  })
})

describe('socket level tests', () => {
  test('it retries upon timeout', (done) => {
    let n = 0
    const socketServer = net.createServer(socket => {
      n++
      // this socket server never says anything
    })
    socketServer.listen(() => {
      upload({
        apiKey: 'API_KEY',
        endpoint: `http://localhost:${socketServer.address().port}`,
        sourceMap: `${__dirname}/fixtures/noop.min.js.map`
      }).then(() => {
        socketServer.close()
        fail(new Error('expected promise to be rejected'))
      }).catch(e => {
        socketServer.close()
        expect(n).toBe(5)
        expect(e).toBeTruthy()
        expect(e.code).toBe('ESOCKETTIMEDOUT')
        done()
      })
    })
  })

  test('it works when the server stops timing out', (done) => {
    let n = 0
    let port = null
    const socketServer = net.createServer(socket => {
      n++
      if (n < 3) return
      socketServer.close()
      createTestServer(port).then(() => {
        app.post('/', (req, res) => {
          n++
          return res.sendStatus(200)
        })
      })
    })
    socketServer.listen(() => {
      port = socketServer.address().port
      upload({
        apiKey: 'API_KEY',
        endpoint: `http://localhost:${port}`,
        sourceMap: `${__dirname}/fixtures/noop.min.js.map`
      }).then(() => {
        socketServer.close()
        expect(n).toBe(4)
        closeTestServer()
        done()
      }).catch(err => fail(err))
    })
  })

  test('it returns the correct error in a synchronous failure', () => {
    return upload({
      apiKey: 'API_KEY',
      // the easiest way to trigger a synchronous
      // thrown error in request is a malformed url:
      endpoint: `1231..;`,
      sourceMap: `${__dirname}/fixtures/noop.min.js.map`
    }).then(() => {
      fail(new Error('expected promise to be rejected'))
    }).catch(err => {
      expect(err).toBeTruthy()
      expect(err.message).toBe('Invalid URI "1231..;"')
    })
  })
})

let server, app
const createTestServer = (port) => {
  return new Promise((resolve, reject) => {
    const _app = express()
    const listenArgs = []
      .concat(port || [])
      .concat((err) => {
        if (err) return reject(err)
        server = _server
        app = _app
        resolve()
      })
    const _server = _app.listen.apply(_app, listenArgs)
  })
}

const closeTestServer = () => {
  server.close()
  server = null
  app = null
}
