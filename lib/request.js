'use strict'

const request = require('request')
const MAX_ATTEMPTS = 5
const RETRY_INTERVAL = process.env.BUGSNAG_RETRY_INTERVAL || 1000

module.exports = (url, data) => {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const maybeRetry = (err) => {
      attempts++
      if (err && err.isRetryable && attempts < MAX_ATTEMPTS) return setTimeout(go, RETRY_INTERVAL)
      return reject(err)
    }
    const go = () => send(url, data, resolve, maybeRetry)
    go()
  })
}

const send = (url, formData, onSuccess, onError) => {
  request.post({ url, formData }, (err, res, body) => {
    if (err || res.statusCode !== 200) {
      err = err || new Error(`${res.statusMessage} (${res.statusCode}) - ${body}`)
      if (res && (res.statusCode < 400 || res.statusCode >= 500)) {
        err.isRetryable = true
      }
      onError(err)
    } else {
      onSuccess()
    }
  })
}
