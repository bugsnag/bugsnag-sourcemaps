const fs = require('graceful-fs');
const request = require('request');
const path = require('path');

const DEFAULT_OPTIONS = {
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
  projectRoot: '.',
  stripProjectRoot: true,
  addWildcardPrefix: false,
};

/**
 * Combines the default options with the user provided ones.
 *
 * @param {object} options The user provided options
 * @returns {object} The combined options
 */
function applyDefaults(options) {
  return Object.assign({}, DEFAULT_OPTIONS, options);
}

/**
 * Checks that the any required options are present and are not malformed. Some options also
 * depend on each other in order to function correctly. Throws an error when there's a voilation.
 *
 * @param {object} options The options
 * @returns {object}
 */
function validateOptions(options) {
  if (typeof options.apiKey !== 'string') {
    throw new Error('You must provide a valid API key to upload sourcemaps to Bugsnag.');
  }
  if (options.addWildcardPrefix && !options.stripProjectRoot) {
    options.stripProjectRoot = true;
  }
  if (options.uploadSources && !options.projectRoot) {
    throw new Error('You must provide a project root when uploading sources. ' +
      'The project root is used to generate relative paths to the sources.');
  }
  if (options.stripProjectRoot && !options.projectRoot) {
    throw new Error('You must provide a project root when stripping the root ' +
      'path from the source map.');
  }
  if (options.projectRoot && !path.isAbsolute(options.projectRoot)) {
    options.projectRoot = path.resolve(options.projectRoot);
  }
  return options;
}

/**
 * Strips the project root from the file path.
 *
 * @param {string} projectRoot The project root path
 * @param {string} filePath The file path
 * @returns {string}
 */
function stripProjectRoot(projectRoot, filePath) {
  if (typeof filePath === 'string') {
    // Check whether the path is an posix absolute file, otherwise check whether it's a
    // win32 valid absolute file. The order is important here because win32 treats posix
    // absolute paths as absolute, but posix doesn't do the same for win32.
    const p = path.posix.isAbsolute(filePath) ? path.posix
            : path.win32.isAbsolute(filePath) ? path.win32
            : null;
    if (p) {
      const relative = p.relative(projectRoot, filePath);
      if (relative.indexOf('.') !== 0) {
        return relative;
      }
    }
  }
  return filePath;
}

/**
 * Reads a file and parses the content a JSON.
 *
 * If the file could not be read (because it doesn't exist) or it is not valid JSON, the
 * promise is rejected - both cases with the Error object.
 *
 * @param {string} path The path to the file
 * @returns {Promise<object>} The JSON contents of the file
 */
function readFileJSON(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        const json = JSON.parse(String(data));
        resolve(json);
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * Checks whether a file exists (async Promise version of fs.existsStat).
 *
 * @param {string} path The file path
 * @returns {Promise<boolean>}
 */
function doesFileExist(path) {
  return new Promise(resolve => {
    fs.stat(path, (err, stat) => {
      // The file exists if there were no errors, and it's a file
      resolve(!err && stat.isFile());
    });
  });
}

/**
 * Replaces (maps over) the source paths from the source map.
 *
 * @param {object} sourceMap The source map contents
 * @param {function} mapCallback Map the values of the source paths
 */
function mapSources(sourceMap, mapCallback) {
  let chain = Promise.resolve();
  function pushChain(path, index, arr) {
    chain = chain
      .then(() => mapCallback(path))
      .then(replacement => {
        arr[index] = replacement || path;
      });
  }
  if (sourceMap.sources) {
    sourceMap.sources.forEach(pushChain);
  }
  if (sourceMap.sections) {
    sourceMap.sections.forEach(section => {
      if (section.map && section.map.sources) {
        section.map.sources.forEach(pushChain);
      }
    });
  }
  return chain.then(() => sourceMap);
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
function transformSourcesMap(options) {
  return (
    readFileJSON(options.sourceMap)
      .then(sourceMap => (
        mapSources(sourceMap, path => {
          const relativePath = stripProjectRoot(options.projectRoot, path);
          return doesFileExist(path).then(exists => {
            if (exists && options.uploadSources) {
              options.sources[relativePath] = path;
            }
            return relativePath;
          });
        })
      ))
      .then(sourceMap => {
        // Replace the sourceMap option with a buffer of the modified sourcemap.
        const tempMap = path.join(options.tempDir, path.basename(options.sourceMap));
        fs.writeFileSync(tempMap, JSON.stringify(sourceMap)); // FIXME find out why passing a Buffer instead of a fs.ReadStream throws "maxFieldsSize 2097152 exceeded"
        options.sourceMap = tempMap;
        return options;
      })
      .catch(err => {
        throw new Error(`Source map file could not be read (doesn't exist or isn't valid JSON).`);
      })
  );
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
function transformOptions(options) {
  if (options.codeBundleId && options.appVersion) {
    delete options.appVersion;
  }
  if (options.addWildcardPrefix && options.minifiedUrl) {
    if (options.minifiedUrl.indexOf('://') == -1 && options.minifiedUrl[0] != '*')
      options.minifiedUrl = '*/' + options.minifiedUrl;
  }
  if (options.stripProjectRoot) {
    options.tempDir = fs.mkdtempSync('bugsnag-sourcemaps');
    return transformSourcesMap(options);
  }
  return options;
}

/**
 * Returns a fs.ReadStream or a Buffer, depending on whether the "path" argument is a
 * valid file path or whether it's a Buffer object (used for sourceMap when uploadSources
 * is set to `true`, because the sourcemap is modified).
 *
 * @param {string|Buffer} path The path of the file, or the file Buffer
 * @returns {fs.ReadStream|Buffer}
 */
function createReadStream(path) {
  if (typeof path === 'string') {
    return fs.createReadStream(path);
  }
  else if (Buffer.isBuffer(path)) {
    return path;
  }
  else {
    throw new Error(`Unknown read stream path of type "${typeof path}"`);
  }
}

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
function prepareRequest(options) {
  const formData = {};
  Object.keys(options).forEach(function(name) {
    const value = options[name];
    // Skip option if values are null/undefined
    if (value === null || typeof value === 'undefined') {
      return;
    }
    switch(name) {
      // Single file/buffer stream fields
      case 'sourceMap':
      case 'minifiedFile': {
        formData[name] = createReadStream(value);
        break;
      }
      // All additional file streams field
      case 'sources': {
        Object.keys(value).forEach(function (sourceUrl) {
          const sourcePath = value[sourceUrl];
          const key = options.addWildcardPrefix ? '*/' + sourceUrl : sourceUrl;
          formData[key] = createReadStream(sourcePath);
        });
        break;
      }
      // Ignored settings (omit from formData)
      case 'endpoint':
      case 'uploadSources':
      case 'projectRoot':
      case 'stripProjectRoot':
      case 'addWildcardPrefix':
      case 'tempDir': {
        break;
      }
      // Basic fields (strings/booleans) & future fields
      default: {
        formData[name] = String(value);
        break;
      }
    }
  });
  return {
    options,
    formData,
  };
}

/**
 * Posts the form data to the endpoint.
 *
 * If the endpoint returns a status code other than 200, the promise is rejected.
 *
 * @param {{options: object, formData: object}}
 * @returns {Promise<string>}
 */
function sendRequest({ options, formData }) {
  return new Promise((resolve, reject) => {
    request.post({
      url: options.endpoint,
      formData,
    }, function (err, res, body) {
      if (err || res.statusCode !== 200) {
        reject(err || new Error(`${res.statusMessage} (${res.statusCode}) - ${body}`));
      } else {
        resolve(options);
      }
    });
  });
}

/**
 * Removes temporary files generated by the upload process.
 *
 * @param {object} options The options
 * @returns {Promise<object>}
 */
function cleanupTempFiles(options) {
  return new Promise((resolve, reject) => {
    if (options.tempDir && path.dirname(options.sourceMap) === options.tempDir) {
      fs.unlinkSync(options.sourceMap);
      fs.rmdir(options.tempDir, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        };
      });
    } else {
      resolve();
    }
  });
}

/**
 * Upload source map to Bugsnag.
 *
 * @param {object} options The options
 * @param {function} [callback] The node-style callback (optional)
 * @returns {Promise<string>}
 */
function upload(options, callback) {
  const promise = (
    Promise.resolve(options)
      .then(applyDefaults)
      .then(validateOptions)
      .then(transformOptions)
      .then(opts => options = opts)
      .then(prepareRequest)
      .then(sendRequest)
      .catch(err => {
        return cleanupTempFiles(options)
          .then(() => Promise.reject(err));
      })
      .then(cleanupTempFiles)
  );
  if (callback) {
    promise
      .then(message => callback(null, message))
      .catch(err => callback(err, null));
  }
  return promise;
}

exports.upload = upload;

if (process.env.NODE_ENV === 'test') {
  Object.assign(exports, {
    applyDefaults,
    validateOptions,
    stripProjectRoot,
    readFileJSON,
    doesFileExist,
    mapSources,
    transformSourcesMap,
    transformOptions,
    createReadStream,
    prepareRequest,
    sendRequest,
    cleanupTempFiles,
    upload,
  });
}
