const fs = require('fs');
const request = require('request');

const DEFAULT_OPTIONS = {
  apiKey: null,
  // appVersion: null,
  minifiedUrl: null,
  sourceMap: null,
  // minifiedFile: null,
  // override: false,
  // sources: {},
  endpoint: 'https://upload.bugsnag.com',
};

function upload(options, callback) {
  const promise = new Promise(function (resolve, reject) {
    const optionsWithDefaults = Object.assign({}, DEFAULT_OPTIONS, options);
    if (!optionsWithDefaults.apiKey) {
      throw new Error('You must provide your API key to upload sourcemaps to Bugsnag.');
    }
    const formData = {};
    Object.keys(optionsWithDefaults).forEach(function (fieldName) {
      const fieldValue = optionsWithDefaults[fieldName];
      switch(fieldName) {
        // Single file stream fields
        case 'sourceMap':
        case 'minifiedFile': {
          formData[fieldName] = fs.createReadStream(fieldValue);
          break;
        }
        // All additional file streams field
        case 'sources': {
          Object.keys(fieldValue).forEach(function (sourceUrl) {
            const sourcePath = fieldValue[sourceUrl];
            formData[sourceUrl] = fs.createReadStream(sourcePath);
          });
          break;
        }
        // Settings (omit from formData)
        case 'endpoint': {
          break;
        }
        // Basic fields (strings/booleans) & future fields
        default: {
          formData[fieldName] = String(fieldValue);
          break;
        }
      }
    });
    request.post({
      url: optionsWithDefaults.endpoint,
      formData,
    }, function (err, res, body) {
      if (err || res.statusCode !== 200) {
        reject(err || new Error(body));
      } else {
        resolve(null);
      }
    });
  });
  if (callback) {
    promise.then(callback).catch(callback);
  }
  return promise;
}

exports.upload = upload;
