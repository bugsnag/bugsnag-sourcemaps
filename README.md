# bugsnag-sourcemap

A Node.js module to programmatically upload your sourcemap files to Bugsnag.

## Installation

```sh
$ npm install --save-dev bugsnag-sourcemap
```

## Usage

```js
import path from 'path';
import { upload } from 'bugsnag-sourcemap';

upload({
  apiKey: 'YOUR_API_KEY_HERE',
  appVersion: '1.2.3', // optional
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

## License

MIT License ❤️