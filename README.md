# bugsnag-sourcemaps

[![Latest version](https://img.shields.io/npm/v/bugsnag-sourcemaps.svg)](https://www.npmjs.com/package/bugsnag-sourcemaps)
[![Next version](https://img.shields.io/npm/v/bugsnag-sourcemaps/next.svg)](https://www.npmjs.com/package/bugsnag-sourcemaps)
[![Dependencies](https://david-dm.org/jmshal/bugsnag-sourcemaps.svg)](https://david-dm.org/jmshal/bugsnag-sourcemaps)
[![Monthly downloads](https://img.shields.io/npm/dm/bugsnag-sourcemaps.svg)](https://www.npmjs.com/package/bugsnag-sourcemaps)
[![License](https://img.shields.io/npm/l/bugsnag-sourcemaps.svg)](./LICENSE)

A Node.js module to programmatically upload your sourcemap files to Bugsnag.

## Installation

```sh
$ npm install --save-dev bugsnag-sourcemaps
```

## Command-line Usage

`bugsnag-sourcemaps` provides a command-line interface for uploading source maps
directly. Run `bugsnag-sourcemaps --help` for a list of all options.

```shell
$ npm run bugsnag-sourcemaps -- --api-key YOUR_API_KEY_HERE \
    --app-version 1.2.3 \
    --minified-url 'http://example.com/assets/example.min.js' \
    --source-map path/to/example.js.map \
    --minified-file path/to/example.min.js \
    --overwrite \
    --upload-sources
```

### Options

```
-h, --help                 Prints this message
-k, --api-key KEY          Your project API key
-v, --app-version VERSION  The version number of your app
-c, --code-bundle-id ID    The code bundle id (react native only)
-e, --endpoint URL         The URL of the upload server
-m, --minified-url URL     The URL your users will request your bundle
-s, --source-map PATH      The path of the source map file (local)
-p, --minified-file PATH   The path of the bundle (local)
-u, --upload-sources       Upload source files referenced by the source map
-r, --project-root PATH    The root path to remove from absolute file paths
-t, --strip-project-root   Strip the root path from file paths in the source map
-w, --add-wildcard-prefix  Insert a wildcard prefix when stripping root path
-o, --overwrite            Overwite previously uploaded source maps
```

## API Usage

```js
import path from 'path';
import { upload } from 'bugsnag-sourcemaps';

upload({
  apiKey: 'YOUR_API_KEY_HERE',
  appVersion: '1.2.3', // optional
  codeBundleId: '1.0-123', // optional (react-native only)
  minifiedUrl: 'http://example.com/assets/example.min.js', // supports wildcards
  sourceMap: path.resolve(__dirname, 'path/to/example.js.map'),
  minifiedFile: path.resolve(__dirname, 'path/to/example.min.js'), // optional
  overwrite: true, // optional
  sources: {
    'http://example.com/assets/main.js': path.resolve(__dirname, 'path/to/main.js'),
    'http://example.com/assets/utils.js': path.resolve(__dirname, 'path/to/utils.js'),
  },
}, function(err) {
  if (err) {
    throw new Error('Something went wrong! ' + err.message);
  }
  console.log('Sourcemap was uploaded successfully.');
});
```

### Bugsnag Enterprise

If you are using Bugsnag Enterprise (on premise installation) with a custom domain, you can pass an optional `endpoint` option to define a custom upload url.

Example with endpoint option:

```js
import path from 'path';
import { upload } from 'bugsnag-sourcemaps';

upload({
  // apiKey, appVersion, etc...
  endpoint: 'https://bugsnag.my-company.com',
}, function(err) {
  // ...
});
```

## License

MIT License ❤️
