'use strict'

const stat = require('graceful-fs').stat

/**
 * Checks whether a file exists (async Promise version of fs.existsStat).
 *
 * @param {string} path The file path
 * @returns {Promise<boolean>}
 */
module.exports = function doesFileExist (path) {
  return new Promise(resolve => {
    stat(path, (err, stat) => {
      // The file exists if there were no errors, and it's a file
      resolve(!err && stat.isFile())
    })
  })
}
