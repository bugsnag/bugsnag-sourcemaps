'use strict'

const readFile = require('graceful-fs').readFile

/**
 * Reads a file and parses the content a JSON.
 *
 * If the file could not be read (because it doesn't exist) or it is not valid JSON, the
 * promise is rejected - both cases with the Error object.
 *
 * @param {string} path The path to the file
 * @returns {Promise<object>} The JSON contents of the file
 */
module.exports = function readFileJSON (path) {
  return new Promise((resolve, reject) => {
    readFile(path, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      try {
        const json = JSON.parse(String(data))
        resolve(json)
      } catch (err) {
        reject(err)
      }
    })
  })
}
