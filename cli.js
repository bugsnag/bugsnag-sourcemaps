#!/usr/bin/env node

const meow = require('meow');
const Listr = require('listr');
const rc = require('rc');
const readPkgUp = require('read-pkg-up');
const { upload } = require('./');

const cli = meow(`
    Usage
      $ bugsnag-sourcemaps upload

    Options
      -h, --help                 Prints this message
      -k, --api-key KEY          Your project API key
      -v, --app-version VERSION  The version number of your app
      -c, --code-bundle-id ID    The code bundle id (react-native only)
      -u, --minified-url URL     The URL your users will request your bundle
      -s, --source-map PATH      The path of the source map file (local)
      -p, --minified-file PATH   The path of the bundle (local)
      -u, --upload-sources BOOL  Upload source files referenced by the source map
      -r, --project-root PATH    The root path to remove from absolute file paths
      -o, --overwrite BOOL       Overwite previously uploaded source maps

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
          --upload-sources true
`, {
    alias: {
        k: 'api-key',
        v: 'app-version',
        c: 'code-bundle-id',
        u: 'minified-url',
        s: 'source-map',
        p: 'minified-file',
        u: 'upload-sources',
        r: 'project-root',
        o: 'overwrite',
    },
    // minimistOptions: {
    //     string: [
    //         'app-version',
    //     ],
    // },
});

const conf = {
    // Any cli-specific defaults (none currently)
};

// Pull configuration from a local .bugsnagrc file
const sourcemapsrc = rc('bugsnag').sourcemaps || {};
Object.assign(conf, sourcemapsrc[process.env.NODE_ENV] || sourcemapsrc);

// Then extract any overrides from the flags
Object.assign(conf, cli.flags);

for (const key in conf) {
    // Strip out the single letter (aliases) from meow
    if (key.length === 1) {
        delete conf[key];
    }
}

const tasks = new Listr([
    {
        title: 'Uploading sourcemaps',
        task: () => upload(conf),
    },
]);

Promise.resolve()
    .then(() => {
        if (!conf.appVersion) {
            return (
                // If there was no appVersion specified, find the package.json within either
                // the project root, or the current working directory, and use that version.
                readPkgUp(conf.projectRoot || process.cwd())
                    .then(({ pkg }) => conf.appVersion = pkg.version)
            );
        }
    })
    .then(() => {
        return tasks.run();
    })
    .catch(err => {
        // console.error(err);
    });