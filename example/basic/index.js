const path = require('path');
const upload = require('../../').upload;

upload({
  apiKey: '11ae66b95ade0e3fcd02735d4bb44984',
  appVersion: '1.0.3',
  minifiedUrl: 'http://localhost:8080/dist/bundle.js',
  minifiedFile: path.resolve(__dirname, './dist/bundle.js'),
  sourceMap: path.resolve(__dirname, './dist/bundle.js.map'),
  endpoint: 'https://bugsnag.my-company.com', // Bugsnag Enterprise
}).then(() => {
  console.log('#winning');
}).catch(err => {
  console.log('Noooooo! ' + err.message);
});