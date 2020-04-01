#!/usr/bin/env node

const meow = require('meow')
const rc = require('rc')
const logger = require('./lib/cli-logger')
const upload = require('./').upload

const cli = meow(`
    Usage
      $ bugsnag-sourcemaps upload

    Options
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

    Examples
      $ bugsnag-sourcemaps upload \\
          --api-key f915102cdb8153ee934b8549c930aa1b \\
          --app-version 1.0.0 \\
          --minified-url https://cdn.example.com/dist/bundle.js \\
          --source-map dist/bundle.js.map \\
          --minified-file dist/bundle.js
      OR
      $ bugsnag-sourcemaps upload \\
          --api-key f915102cdb8153ee934b8549c930aa1b \\
          --code-bundle-id 1.0-123 \\
          --minified-url main.jsbundle \\
          --source-map dist/main.jsbundle.map \\
          --minified-file dist/main.jsbundle \\
          --upload-sources
      OR
      $ bugsnag-sourcemaps upload \\
          --directory \\
          --api-key f915102cdb8153ee934b8549c930aa1b \\
          --app-version 1.0.0
`, {
  alias: {
    c: 'code-bundle-id',
    e: 'endpoint',
    h: 'help',
    k: 'api-key',
    m: 'minified-url',
    n: 'upload-node-modules',
    o: 'overwrite',
    p: 'minified-file',
    r: 'project-root',
    s: 'source-map',
    u: 'upload-sources',
    v: 'app-version',
    w: 'add-wildcard-prefix',
    d: 'directory'
  },
  string: [
    'app-version',
    'api-key'
  ],
  boolean: [
    'overwrite',
    'upload-node-modules',
    'upload-sources',
    'add-wildcard-prefix'
  ]
})

const conf = {
  // Any cli-specific defaults (none currently)
}

// Pull configuration from a local .bugsnagrc file
const sourcemapsrc = rc('bugsnag').sourcemaps || {}
Object.assign(conf, sourcemapsrc[process.env.NODE_ENV] || sourcemapsrc)

// Then extract any overrides from the flags
Object.assign(conf, cli.flags)

for (const key in conf) {
  // Strip out the single letter (aliases) from meow
  if (key.length === 1) {
    delete conf[key]
  }
}

upload(conf, logger).catch(err => {
  const stack = (err && err.stack) ? err.stack : err
  const apiResponse = (err && err.errors) ? `\n\n  API response:\n    ${err.errors.join(', ')}\n` : ''
  logger.error(`Error uploading source maps: ${stack}${apiResponse}`)
  process.exitCode = 1
})
