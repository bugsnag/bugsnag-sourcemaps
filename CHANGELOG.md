# 1.3.0 (2020-04-01)

## Improvements

* Add support for configuring a proxy agent [#53](https://github.com/bugsnag/bugsnag-sourcemaps/pull/53)

# 1.2.2 (2019-11-01)

## Bug fixes

* Prevent `webpack:///` paths from being treated as relative and resolving incorrectly [#49](https://github.com/bugsnag/bugsnag-sourcemaps/pull/49)

# 1.2.1 (2019-05-23)

## Bug fixes

* Fix a bug with `--upload-sources`, and ensure it works in conjunction with directory mode [#43](https://github.com/bugsnag/bugsnag-sourcemaps/pull/43)

# 1.2.0 (2019-05-22)

## Improvements

* Add `--directory` mode [#40](https://github.com/bugsnag/bugsnag-sourcemaps/pull/40)
* Transform relative paths in source map `sources[]` property [#41](https://github.com/bugsnag/bugsnag-sourcemaps/pull/41)
* Retry in more kinds of network failures [#39](https://github.com/bugsnag/bugsnag-sourcemaps/pull/39)
* Tolerate `ENOTEMPTY` when attempting to delete a directory [#38](https://github.com/bugsnag/bugsnag-sourcemaps/pull/38)

# 1.1.0

## Improvements

* Use a non-zero exit code when the CLI is unsuccessful (#32)
* Add standardjs linter (#35)
* Ensure `--api-key` CLI option is always parsed as a string (#33)

# 1.0.7

## Improvements

* Fix error handling logic for missing res param (#31)

# 1.0.6

## Improvements

* Don't set `appVersion=""` when it is not present in `package.json` (#30, fixes #29)

# 1.0.5

## Improvements

* Retry failed requests up to 5 times (#26)

# 1.0.4

## Bug fixes

* Ensure correct values for `overwrite` are sent to API (#24)
* Ensure OS tempdir is used for temporary files (rather than the current directory) (#22)

# 1.0.3

## Maintenance

* Improve error messaging (#20)
* Ensure temporary directories are cleaned up (#20)
* Ensure `sourceMap` option is set (#19)

# 1.0.2

## Maintenance

* Support older versions of node (4.8+)

# 1.0.1

## Bug fixes

* Improve wildcard support by being more flexible with bundle paths

# 1.0.0

## Enhancements

* Add command-line interface
* Support uploading source maps for [React Native](https://docs.bugsnag.com/platforms/react-native/showing-full-stacktraces/)
