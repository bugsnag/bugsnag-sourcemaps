exports.debug = function () {
  console.debug(new Date(), arguments)
}

exports.info = function () {
  console.info(new Date(), arguments)
}

exports.warn = function () {
  console.warn(new Date(), arguments)
}

exports.error = function () {
  console.error(new Date(), arguments)
}
