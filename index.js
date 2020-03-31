'use strict'

const glob = require('glob')
const parallel = require('run-parallel-limit')
const path = require('path')

const request = require('./lib/request')
const prepareRequest = require('./lib/prepare-request')
const cleanupTempFiles = require('./lib/cleanup-temp-files')
const validateOptions = require('./lib/options').validateOptions
const applyDefaults = require('./lib/options').applyDefaults
const transformOptions = require('./lib/options').transformOptions
const getAppVersion = require('./lib/get-app-version')

const noopLogger = { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} }

/**
 * Triggers the sending of a request.
 *
 * @param {{options: object, formData: object}}
 * @returns {Promise<string>}
 */
function sendRequest (options) {
  return new Promise((resolve, reject) => request(options.endpoint, () => prepareRequest(options), () => resolve(options), reject, options))
}

/**
 * Upload source maps to Bugsnag.
 *
 * @param {object} options The options
 * @param {object} logger A logger object (optional)
 * @param {function} callback The node-style callback (optional)
 * @returns {Promise<void>}
 */
function upload (options, logger, callback) {
  if (typeof logger === 'function') {
    callback = logger
    logger = noopLogger
  }
  if (typeof logger === 'undefined') {
    logger = noopLogger
  }
  const promise = (
    Promise.resolve(options)
      .then(getAppVersion)
      .then(applyDefaults)
      .then(validateOptions)
      .then(opts => {
        options = opts
        return options
      })
      .then(options => !options.directory ? uploadOne(options, logger) : uploadMany(options, logger))
  )
  if (callback) {
    promise
      .then(() => callback(null))
      .catch(err => callback(err, null))
  }
  return promise
}

/**
 * Uploads a single source map.
 *
 * @param {object} options The options
 * @param {object} logger A logger object (optional)
 * @returns {Promise<void>}
 */
function uploadOne (options, logger) {
  logger.info(`Uploading (${path.basename(options.sourceMap)})`)
  return Promise.resolve(options)
    .then(transformOptions)
    .then(sendRequest)
    .catch(err => cleanupTempFiles(options).then(() => Promise.reject(err)))
    .then(cleanupTempFiles)
}

/**
 * Searches a directory and uploads multiple source maps.
 *
 * @param {object} options The options
 * @param {object} logger A logger object (optional)
 * @returns {Promise<void>}
 */
function uploadMany (options, logger) {
  return new Promise((resolve, reject) => {
    const pattern = path.join(options.directory !== true ? options.directory : options.projectRoot, '**/*.map')
    glob(pattern, { ignore: '**/node_modules/**' }, (err, files) => {
      if (err) return reject(err)

      logger.info(`Found ${files.length} source map(s) to upload`)
      const uploads = files.map(f => {
        const minifiedUrl = path.relative(options.projectRoot, f.replace(/\.map$/, ''))
        const minifiedFile = f.replace(/\.map$/, '')
        return cb => {
          const opts = Object.assign({}, options, { sourceMap: f, minifiedUrl: minifiedUrl, minifiedFile: minifiedFile, sources: {} })
          uploadOne(opts, logger)
            .then(() => {
              logger.info(`Upload successful (${path.basename(f)})`)
              cb()
            })
            .catch(cb)
        }
      })

      parallel(uploads, 5, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  })
}

exports.upload = upload
