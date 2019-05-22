'use strict'

const path = require('path')

/**
 * Strips the project root from the file path.
 *
 * @param {string} projectRoot The project root path
 * @param {string} filePath The file path
 * @returns {string}
 */
module.exports = function stripProjectRoot (projectRoot, filePath) {
  if (typeof filePath === 'string') {
    // Check whether the path is an posix absolute file, otherwise check whether it's a
    // win32 valid absolute file. The order is important here because win32 treats posix
    // absolute paths as absolute, but posix doesn't do the same for win32.
    const p = path.posix.isAbsolute(filePath) ? path.posix
      : path.win32.isAbsolute(filePath) ? path.win32
        : null
    if (p) {
      const relative = p.relative(projectRoot, filePath)
      if (relative.indexOf('.') !== 0) {
        return relative
      }
    }
  }
  return filePath
}
