const fs = require('fs');
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
  projectRoot: null,
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
  if (typeof options.apiKey !== 'string' || options.apiKey.length !== 32) {
    throw new Error('You must provide a valid API key to upload sourcemaps to Bugsnag.');
  }
  if (options.uploadSources && !options.projectRoot) {
    throw new Error('You must provide a project root when uploading sources. ' +
      'The project root is used to generate relative paths to the sources.');
  }
  return options;
}

/**
 * Returns a relative path from a project root.
 *
 * @param {string} projectRoot The project root path
 * @param {string} filePath The file path
 * @returns {string}
 */
function getRelativePath(projectRoot, filePath) {
  if (typeof filePath === 'string' && path.isAbsolute(filePath)) {
    return path.relative(projectRoot, filePath);
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
 * Extracts the source list from the source map contents.
 *
 * The list contains the original file paths from the source map - which are usually absolute.
 *
 * @param {object} sourceMap The source map contents
 * @returns {Array<string>}
 */
function parseSources(sourceMap) {
  let files = [];
  if (sourceMap.sources) {
    files = files.concat(sourceMap.sources);
  }
  if (sourceMap.sections) {
    contents.sections.forEach(section => {
      if (section.map && section.map.sources) {
        files = files.concat(section.map.sources);
      }
    });
  }
  return files;
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
function transformUploadSources(options) {
  return (
    readFileJSON(options.sourceMap)
      .then(sourceMap => {
        parseSources(sourceMap).forEach(path => {
          const relativePath = getRelativePath(options.projectRoot, path);
          options.sources[relativePath] = path;
        });
        return options;
      })
      .catch(err => {
        console.log(err);
        throw new Error('Could not upload sources, source map file could not be read.');
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
  if (options.uploadSources) {
    return transformUploadSources(options);
  }
  return options;
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
      // Single file stream fields
      case 'sourceMap':
      case 'minifiedFile': {
        formData[name] = fs.createReadStream(value);
        break;
      }
      // All additional file streams field
      case 'sources': {
        Object.keys(value).forEach(function (sourceUrl) {
          const sourcePath = value[sourceUrl];
          formData[sourceUrl] = fs.createReadStream(sourcePath);
        });
        break;
      }
      // Ignored settings (omit from formData)
      case 'endpoint':
      case 'uploadSources':
      case 'projectRoot': {
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
        reject(err || new Error(body));
      } else {
        resolve(body);
      }
    });
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
      .then(prepareRequest)
      .then(sendRequest)
  );
  if (callback) {
    promise
      .then(message => callback(null, message))
      .catch(err => callback(err, null));
  }
  return promise;
}

exports.upload = upload;
