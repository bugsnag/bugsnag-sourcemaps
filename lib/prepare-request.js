'use strict'

const createReadStream = require('graceful-fs').createReadStream

/**
 * Constructs the request's form data.
 *
 * Mainly, file read streams are created for the source map, minified file and the sources.
 * Any unknown options are simply added to the form data, to allow for any future options.
 *
 * Some options are omitted from the form data, as they are only used as configuration.
 * E.g. "endpoint", "uploadSources", and "projectRoot".
 *
 * Note: Form data fields need to be either strings or streams. Booleans are stringified.
 *
 * @param {object} options The options
 * @returns {{options: object, formData: object}}
 */
module.exports = function prepareRequest (options) {
  const formData = {}
  Object.keys(options).forEach(function (name) {
    const value = options[name]
    // Skip option if values are null/undefined
    if (value === null || typeof value === 'undefined') {
      return
    }
    switch (name) {
      // Single file/buffer stream fields
      case 'sourceMap':
      case 'minifiedFile': {
        formData[name] = createReadStream(value)
        break
      }
      // All additional file streams field
      case 'sources': {
        Object.keys(value).forEach(function (sourceUrl) {
          const sourcePath = value[sourceUrl]
          const key = options.addWildcardPrefix ? '*' + sourceUrl : sourceUrl
          formData[key] = getSendableSource(sourcePath)
        })
        break
      }
      // Ignored settings (omit from formData)
      case 'endpoint':
      case 'uploadSources':
      case 'uploadNodeModules':
      case 'projectRoot':
      case 'stripProjectRoot':
      case 'addWildcardPrefix':
      case 'tempDir':
      case 'agent': {
        break
      }
      case 'overwrite': {
        // the presence of any value for this flag causes the API to interpret it as
        // true, so only add it to the payload if it is truthy
        if (options.overwrite) {
          formData[name] = String(value)
        }
        break
      }
      // Basic fields (strings/booleans) & future fields
      default: {
        formData[name] = String(value)
        break
      }
    }
  })
  return formData
}

/**
 * Returns a fs.ReadStream or a Buffer, depending on whether the "path" argument is a
 * valid file path or whether it's a Buffer object (used for sourceMap when uploadSources
 * is set to `true`, because the sourcemap is modified).
 *
 * @param {string|Buffer} pathOrBuffer The path of the file, or the file Buffer
 * @returns {fs.ReadStream|Buffer}
 */
function getSendableSource (pathOrBuffer) {
  if (typeof pathOrBuffer === 'string') {
    return createReadStream(pathOrBuffer)
  } else if (Buffer.isBuffer(pathOrBuffer)) {
    return pathOrBuffer
  } else {
    throw new Error(`Unknown read stream path of type "${typeof pathOrBuffer}"`)
  }
}
