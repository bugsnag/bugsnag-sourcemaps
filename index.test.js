const {
  upload,
} = require('./index');

test('upload function exists', () => {
  expect(typeof upload).toBe('function');
});
