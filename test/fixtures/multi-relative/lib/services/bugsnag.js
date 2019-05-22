const bugsnag = require('@bugsnag/js');

const bugsnagClient = bugsnag({
  apiKey: '318ea01934cbfc3262e1d9eab9589784',
  appVersion: require('../../package.json').version
});
module.exports = bugsnagClient;
//# sourceMappingURL=bugsnag.js.map