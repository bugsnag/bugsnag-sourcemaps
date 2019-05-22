const stripProjectRoot = require('../strip-project-root')

describe('stripProjectRoot', () => {
  test('strips project root', () => {
    expect(stripProjectRoot(
      '/Users/test/git/my-app/',
      '/Users/test/git/my-app/src/index.js'
    )).toBe('src/index.js')
  })

  test('strips project root with no trailing slash', () => {
    expect(stripProjectRoot(
      '/Users/test/git/my-app',
      '/Users/test/git/my-app/src/index.js'
    )).toBe('src/index.js')
  })

  test(`wont strip project root when path is not within project root`, () => {
    expect(stripProjectRoot(
      '/Users/test/git/another-app',
      '/Users/test/git/my-app/src/index.js'
    )).toBe('/Users/test/git/my-app/src/index.js')
  })

  test('strips project root from node_moodules', () => {
    expect(stripProjectRoot(
      '/Users/test/git/my-app',
      '/Users/test/git/my-app/node_modules/some-module/lib/something.js'
    )).toBe('node_modules/some-module/lib/something.js')
  })

  test(`won't strip project root when path is absolute`, () => {
    expect(stripProjectRoot(
      '/Users/test/git/my-app',
      'src/index.js'
    )).toBe('src/index.js')
  })

  test('strips project root for Windows paths (forward slash)', () => {
    expect(stripProjectRoot(
      'C:/Users/test/git/my-app',
      'C:/Users/test/git/my-app/src/index.js'
    )).toBe('src\\index.js')
  })

  test('strips project root for Windows paths (back slash)', () => {
    expect(stripProjectRoot(
      'C:\\Users\\test\\git\\my-app',
      'C:\\Users\\test\\git\\my-app\\src\\index.js'
    )).toBe('src\\index.js')
  })
})
