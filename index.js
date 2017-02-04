const fs = require('fs');
const request = require('request');

const UPLOAD_URL = 'https://upload.bugsnag.com';
const DEFAULT_OPTIONS = {
  apiKey: null,
  // appVersion: null,
  minifiedUrl: null,
  sourceMap: null,
  // minifiedFile: null,
  // override: false,
  // sources: {},
};

function upload(options, callback) {
  const optionsWithDefaults = Object.assign({}, DEFAULT_OPTIONS, options);
  if (!optionsWithDefaults.apiKey) {
    throw new Error('You must provide your API key to upload sourcemaps to Bugsnag.');
  }
  const formData = {};
  Object.keys(optionsWithDefaults).forEach(fieldName => {
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
        Object.keys(fieldValue).forEach(sourceUrl => {
          const sourcePath = fieldValue[sourceUrl];
          formData[sourceUrl] = fs.createReadStream(sourcePath);
        });
        break;
      }
      // Basic fields (strings/booleans) & future fields
      default: {
        formData[fieldName] = fieldValue;
        break;
      }
    }
  });
  request.post({
    url: UPLOAD_URL,
    formData,
  }, (err, res, body) => {
    if (err || res.statusCode !== 200) {
      callback(err || new Error(body));
    } else {
      callback(null);
    }
  });
}

exports.upload = upload;