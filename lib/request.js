'use strict'

const request = require('request')
const MAX_ATTEMPTS = 5
const RETRY_INTERVAL = parseInt(process.env.BUGSNAG_RETRY_INTERVAL) || 1000
const TIMEOUT = parseInt(process.env.BUGSNAG_TIMEOUT) || 30000

module.exports = (url, data) => {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const maybeRetry = (err) => {
      attempts++
      if (err && err.isRetryable !== false && attempts < MAX_ATTEMPTS) return setTimeout(go, RETRY_INTERVAL)
      return reject(err)
    }
    const go = () => send(url, data, resolve, maybeRetry)
    go()
  })
}

const send = (url, formData, onSuccess, onError) => {
  try {
    request.post({ url, formData, timeout: TIMEOUT }, (err, res, body) => {
      if (err || res.statusCode !== 200) {
        err = err || new Error(`${res.statusMessage} (${res.statusCode}) - ${body}`)
        if (res && !isRetryable(res.statusCode)) {
          err.isRetryable = false
        }
        onError(err)
      } else {
        onSuccess()
      }
    })
  } catch (e) {
    onError(e)
  }
}

const isRetryable = status => {
  return (
    status < 400 ||
    status > 499 ||
    [
      408, // timeout
      429 // too many requests
    ].includes(status))
}
