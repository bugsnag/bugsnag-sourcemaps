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
