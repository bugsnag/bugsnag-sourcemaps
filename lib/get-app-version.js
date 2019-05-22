const readPkgUp = require('read-pkg-up')

module.exports = function getAppVersion (options) {
  if (!options.appVersion && !options.codeBundleId) {
    return (
      // If there was no appVersion specified, find the package.json within either
      // the project root, or the current working directory, and use that version.
      readPkgUp(options.projectRoot || process.cwd())
        .then(arg => {
          const pkg = arg && arg.pkg ? arg.pkg : null
          // only use pkg.version if it's truthy, because read-pkg-up will
          // set it to "" (empty string) when it's missing
          if (pkg && pkg.version) options.appVersion = pkg.version
          return options
        })
    )
  }

  return Promise.resolve(options)
}
