'use strict'

const upload = require('../').upload

test('upload function exists', () => {
  expect(typeof upload).toBe('function')
})
