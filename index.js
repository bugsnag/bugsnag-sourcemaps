'use strict'

const request = require('./lib/request')
const prepareRequest = require('./lib/prepare-request')
const cleanupTempFiles = require('./lib/cleanup-temp-files')
const validateOptions = require('./lib/options').validateOptions
const applyDefaults = require('./lib/options').applyDefaults
const transformOptions = require('./lib/options').transformOptions

/**
 * Posts the form data to the endpoint.
 *
 * If the endpoint returns a status code other than 200, the promise is rejected.
 *
 * @param {{options: object, formData: object}}
 * @returns {Promise<string>}
 */
function sendRequest (options) {
  return new Promise((resolve, reject) => request(options.endpoint, () => prepareRequest(options), () => resolve(options), reject))
}

/**
 * Upload source map to Bugsnag.
 *
 * @param {object} options The options
 * @param {function} [callback] The node-style callback (optional)
 * @returns {Promise<string>}
 */
function upload (options, callback) {
  const promise = (
    Promise.resolve(options)
      .then(applyDefaults)
      .then(validateOptions)
      .then(opts => {
        options = opts
        return options
      })
      .then(transformOptions)
      .then(sendRequest)
      .catch(err => {
        return cleanupTempFiles(options)
          .then(() => Promise.reject(err))
      })
      .then(cleanupTempFiles)
  )
  if (callback) {
    promise
      .then(message => callback(null, message))
      .catch(err => callback(err, null))
  }
  return promise
}

exports.upload = upload
