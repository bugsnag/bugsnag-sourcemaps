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

## Custom upload URL
If you are using Bugsnag Enterprise (on premise installation) with a custom domain, you can pass an optional third argument on the upload method to define your upload url.

Same example as above with custom upload url:


```js
import path from 'path';
import { upload } from 'bugsnag-sourcemaps';

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
},
   'https://bugsnag.my-company.com'  // optional
);
```

## License

MIT License ❤️
