# Contribution Guidelines

We are happy you're here and wanting to contribute to bugsnag-sourcemaps!

To get started, first [fork](https://help.github.com/articles/fork-a-repo) the library
on GitHub. Then:

* Build and test your changes
* Commit and push until you are happy with your contribution
* [Make a pull request](https://help.github.com/articles/using-pull-requests)
  describing what you've changed or added and why. The more you can tell about
  your use case helps us to know how to approach review and further discussion.
* Have a nice day! We'll get back to you soon. ✨

Thank you!


## Installing the development dependencies

All of the resources required to build and develop bugsnag-sourcemaps are
available via [npm](https://npmjs.com). To install, run `npm install`.


## Running the tests

The tests depend on the npm dependencies. Once installed, run `npm test`.


## Releasing a new version

If you are a project maintainer, you can release a new version of the library
like so:

0. Write new/updated documentation for uploading source maps to Bugsnag for
   browser JS or React Native as needed. Submit for review. [Start launch
   music](https://www.youtube.com/watch?v=Mu0cE9RgK5M).
1. Commit any outstanding changes.
2. Add an entry to `CHANGELOG.md` describing the new features and fixes in the
   upcoming release. Choose a release version number according to [semantic
   versioning](http://semver.org).
3. Update the version number in `package.json` to match the change log.
4. Commit, tag the commit, and push:

   ```bash
   $ git commit -am "Release v1.x.x" \
       && git tag v1.x.x \
       && git push origin master v1.x.x
   ```

5. Publish a new release on npm by running `npm publish`.
6. Release the new documentation, if any.
