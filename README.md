# bugsnag-sourcemaps

A Node.js module to programmatically upload your sourcemap files to Bugsnag.

## Installation

```sh
$ npm install --save-dev bugsnag-sourcemaps
```

## Usage

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
