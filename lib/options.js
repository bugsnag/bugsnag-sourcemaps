'use strict'

const path = require('path')
const tmpdir = require('os').tmpdir
const writeFileSync = require('graceful-fs').writeFileSync
const mkdtempSync = require('graceful-fs').mkdtempSync
const readFileJSON = require('./read-file-json')
const stripProjectRoot = require('./strip-project-root')
const doesFileExist = require('./does-file-exist')

const DEFAULT_OPTIONS = module.exports.DEFAULT_OPTIONS = {
  apiKey: null,
  appVersion: null,
  codeBundleId: null,
  minifiedUrl: null,
  sourceMap: null,
  minifiedFile: null,
  overwrite: false,
  sources: {},
  endpoint: 'https://upload.bugsnag.com',
  uploadSources: false,
  uploadNodeModules: false,
  projectRoot: process.cwd(),
  stripProjectRoot: true,
  addWildcardPrefix: false
}

/**
 * Combines the default options with the user provided ones.
 *
 * @param {object} options The user provided options
 * @returns {object} The combined options
 */
module.exports.applyDefaults = function applyDefaults (options) {
  return Object.assign({}, DEFAULT_OPTIONS, options)
}

/**
 * Checks that the any required options are present and are not malformed. Some options also
 * depend on each other in order to function correctly. Throws an error when there's a voilation.
 *
 * @param {object} options The options
 * @returns {object}
 */
module.exports.validateOptions = function validateOptions (options) {
  if (typeof options.apiKey !== 'string') {
    throw new Error('You must provide a valid API key to upload sourcemaps to Bugsnag.')
  }
  if (typeof options.sourceMap !== 'string' && !options.directory) {
    throw new Error('You must provide a path to the source map you want to upload.')
  }
  if (options.addWildcardPrefix && !options.stripProjectRoot) {
    options.stripProjectRoot = true
  }
  if (options.uploadSources && !options.projectRoot) {
    throw new Error('You must provide a project root when uploading sources. ' +
      'The project root is used to generate relative paths to the sources.')
  }
  if (options.stripProjectRoot && !options.projectRoot) {
    throw new Error('You must provide a project root when stripping the root ' +
      'path from the source map.')
  }
  if (options.projectRoot && !path.isAbsolute(options.projectRoot)) {
    options.projectRoot = path.resolve(options.projectRoot)
  }
  return options
}

/**
 * Does any last-minute transformations to the options before preparing the request.
 *
 * 1) Removes the "appVersion" option if the "codeBundleId" is set.
 * 2) Extracts the source paths from the source map and adds them to the "sources" option.
 *
 * @param {object} options The options
 * @returns {Promise<object>|object}
 */
module.exports.transformOptions = function transformOptions (options) {
  if (options.codeBundleId && options.appVersion) {
    delete options.appVersion
  }
  if (options.addWildcardPrefix && options.minifiedUrl) {
    if (options.minifiedUrl.indexOf('://') === -1 && options.minifiedUrl[0] !== '*') { options.minifiedUrl = '*' + options.minifiedUrl }
  }
  if (options.stripProjectRoot) {
    options.tempDir = mkdtempSync(path.join(tmpdir(), 'bugsnag-sourcemaps'))
    return transformSourcesMap(options)
  }
  return options
}

/**
 * Extracts the source file paths from the specified source map file, and adds them to
 * the "sources" option, so they are uploaded too.
 *
 * Note: The "projectRoot" option is used to create relative paths to the sources.
 *
 * @param {object} options The options
 * @returns {Promise<object>}
 */
function transformSourcesMap (options) {
  return (
    readFileJSON(options.sourceMap)
      .then(sourceMap => (
        mapSources(sourceMap, p => {
          // don't transform any webpack paths
          if (/^webpack:\/\//.test(p)) return p

          // resolve a relative path in the sources array
          const resolvedPath = path.resolve(path.dirname(options.sourceMap), p)

          // then make it relative to the project root
          const relativePath = stripProjectRoot(options.projectRoot, resolvedPath)

          return doesFileExist(resolvedPath).then(exists => {
            if (exists && options.uploadSources) {
              if (resolvedPath.indexOf('node_modules') !== -1) {
                if (options.uploadNodeModules) {
                  options.sources[relativePath] = resolvedPath
                }
              } else {
                options.sources[relativePath] = resolvedPath
              }
            }
            return relativePath
          })
        })
      ))
      .then(sourceMap => {
        // Replace the sourceMap option with a buffer of the modified sourcemap.
        const tempMap = path.join(options.tempDir, path.basename(options.sourceMap))
        writeFileSync(tempMap, JSON.stringify(sourceMap)) // FIXME find out why passing a Buffer instead of a fs.ReadStream throws "maxFieldsSize 2097152 exceeded"
        options.sourceMap = tempMap
        return options
      })
      .catch(err => {
        if (err.name === 'SyntaxError') {
          throw new Error(`Source map file was not valid JSON (${options.sourceMap})`)
        }
        if (err.code === 'ENOENT') {
          throw new Error(`Source map file does not exist (${options.sourceMap})`)
        }
        throw new Error(`Source map file could not be read (doesn't exist or isn't valid JSON).`)
      })
  )
}

/**
 * Replaces (maps over) the source paths from the source map.
 *
 * @param {object} sourceMap The source map contents
 * @param {function} mapCallback Map the values of the source paths
 */
function mapSources (sourceMap, mapCallback) {
  let chain = Promise.resolve()
  function pushChain (path, index, arr) {
    chain = chain
      .then(() => mapCallback(path))
      .then(replacement => {
        arr[index] = replacement || path
      })
  }
  if (sourceMap.sources) {
    sourceMap.sources.forEach(pushChain)
  }
  if (sourceMap.sections) {
    sourceMap.sections.forEach(section => {
      if (section.map && section.map.sources) {
        section.map.sources.forEach(pushChain)
      }
    })
  }
  return chain.then(() => sourceMap)
}
