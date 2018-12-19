'use strict'

/* global test, expect, beforeEach, afterEach */

process.env.BUGSNAG_RETRY_INTERVAL = 100

const express = require('express')
const upload = require('../').upload

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
    throw new Error('expected promise to be rejected')
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
    throw new Error('expected promise to be rejected')
  }).catch(err => {
    expect(err).toBeTruthy()
    expect(n).toBe(1)
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
    throw new Error('expected promise to be rejected')
  }).catch(err => {
    expect(err).toBeTruthy()
    expect(err.message).toBe('Invalid URI "1231..;"')
  })
})

let server, app
const createTestServer = () => {
  return new Promise((resolve, reject) => {
    const _app = express()
    const _server = _app.listen((err) => {
      if (err) return reject(err)
      server = _server
      app = _app
      resolve()
    })
  })
}

const closeTestServer = () => {
  server.close()
  server = null
  app = null
}
