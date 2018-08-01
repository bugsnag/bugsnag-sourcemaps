'use strict';

const stripProjectRoot = require('./index').stripProjectRoot
const upload = require('./index').upload
const validateOptions = require('./index').validateOptions
const prepareRequest = require('./index').prepareRequest

test('upload function exists', () => {
  expect(typeof upload).toBe('function');
});

describe('stripProjectRoot', () => {
  test('strips project root', () => {
    expect(stripProjectRoot(
      '/Users/test/git/my-app/',
      '/Users/test/git/my-app/src/index.js'
    )).toBe('src/index.js');
  });

  test('strips project root with no trailing slash', () => {
    expect(stripProjectRoot(
      '/Users/test/git/my-app',
      '/Users/test/git/my-app/src/index.js'
    )).toBe('src/index.js');
  });

  test(`wont strip project root when path is not within project root`, () => {
    expect(stripProjectRoot(
      '/Users/test/git/another-app',
      '/Users/test/git/my-app/src/index.js'
    )).toBe('/Users/test/git/my-app/src/index.js');
  });

  test('strips project root from node_moodules', () => {
    expect(stripProjectRoot(
      '/Users/test/git/my-app',
      '/Users/test/git/my-app/node_modules/some-module/lib/something.js'
    )).toBe('node_modules/some-module/lib/something.js');
  });

  test(`won't strip project root when path is absolute`, () => {
    expect(stripProjectRoot(
      '/Users/test/git/my-app',
      'src/index.js'
    )).toBe('src/index.js');
  });

  test('strips project root for Windows paths (forward slash)', () => {
    expect(stripProjectRoot(
      'C:/Users/test/git/my-app',
      'C:/Users/test/git/my-app/src/index.js'
    )).toBe('src\\index.js');
  });

  test('strips project root for Windows paths (back slash)', () => {
    expect(stripProjectRoot(
      'C:\\Users\\test\\git\\my-app',
      'C:\\Users\\test\\git\\my-app\\src\\index.js'
    )).toBe('src\\index.js');
  });
});

describe('validateOptions', () => {
  test('requires "apiKey"/"--api-key"', () => {
    expect(() => {
      validateOptions({})
    }).toThrow('You must provide a valid API key to upload sourcemaps to Bugsnag.');
  });
  test('requires "sourceMap"/"--source-map"', () => {
    expect(() => {
      validateOptions({ apiKey: 'abbcc' })
    }).toThrow('You must provide a path to the source map you want to upload.');
  });
});

describe('prepareRequest', () => {
  test('removes options.overwrite when false', () => {
    expect(prepareRequest({ overwrite: false }).formData).toEqual({});
  });
  test('does not remove options.overwrite when true', () => {
    expect(prepareRequest({ overwrite: true }).formData).toEqual({ overwrite: 'true' });
  });
});
