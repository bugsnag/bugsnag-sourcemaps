# bugsnag-sourcemaps

[![Latest version](https://img.shields.io/npm/v/bugsnag-sourcemaps.svg)](https://www.npmjs.com/package/bugsnag-sourcemaps)
[![Next version](https://img.shields.io/npm/v/bugsnag-sourcemaps/next.svg)](https://www.npmjs.com/package/bugsnag-sourcemaps)
[![Dependencies](https://david-dm.org/bugsnag/bugsnag-sourcemaps.svg)](https://david-dm.org/bugsnag/bugsnag-sourcemaps)
[![Monthly downloads](https://img.shields.io/npm/dm/bugsnag-sourcemaps.svg)](https://www.npmjs.com/package/bugsnag-sourcemaps)
[![Build status](https://travis-ci.org/bugsnag/bugsnag-sourcemaps.svg?branch=master)](https://travis-ci.org/bugsnag/bugsnag-sourcemaps)
[![Build status](https://ci.appveyor.com/api/projects/status/lfm5kxi7ew6i1780?svg=true)](https://ci.appveyor.com/project/jmshal/bugsnag-sourcemaps)

A Node.js module to programmatically upload your sourcemap files to Bugsnag.

## Installation

```sh
$ npm install --global bugsnag-sourcemaps
```

## Command-line Usage

`bugsnag-sourcemaps` provides a command-line interface for uploading source maps
directly. Run `bugsnag-sourcemaps --help` for a list of all options.

For a typical browser bundle, where your build generates a single minified file and accompanying source map:

```shell
$ bugsnag-sourcemaps upload --api-key YOUR_API_KEY_HERE \
    --app-version 1.2.3 \
    --minified-url 'http://example.com/assets/example.min.js' \
    --source-map path/to/example.js.map \
    --minified-file path/to/example.min.js \
    --overwrite \
    --upload-sources
```

For a typical Node.js project, where your build generates a source map per input file (e.g. Babel, TypeScript):

```shell
$ bugsnag-sourcemaps upload --api-key YOUR_API_KEY_HERE \
    --app-version 1.2.3 \
    --directory
```

### Options

```
-h, --help                 Prints this message
-k, --api-key KEY          Your project API key
-v, --app-version VERSION  The version number of your app
-c, --code-bundle-id ID    The code bundle id (react-native only)
-d, --directory [PATH]     Enable directory mode. Searches for multiple source
                           maps in the directory and uploads them all. Only
                           supply a path if the directory you want to search is
                           not the same as your project root.
                           This option makes the following options redundant:
                             --source-map
                             --minified-url
                             --minified-file
-e, --endpoint URL         The URL of the upload server
-m, --minified-url URL     The URL your users will request your bundle
-s, --source-map PATH      The path of the source map file (local)
-p, --minified-file PATH   The path of the bundle (local)
-u, --upload-sources       Upload source files referenced by the source map
-n, --upload-node-modules  Upload dependency files referenced by the source map
-r, --project-root PATH    The root path to remove from absolute file paths
-w, --add-wildcard-prefix  Insert a wildcard prefix when stripping root path
-o, --overwrite            Overwrite previously uploaded source maps
```

## API Usage

```js
import path from 'path';
import { upload } from 'bugsnag-sourcemaps';

upload({
  agent, // optional (node http agent)
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

### Bugsnag On-premise

If you are using Bugsnag On-premise, you should use the `endpoint` option to set the url of your upload server.

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
