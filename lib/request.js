'use strict'

const request = require('request')
const Backoff = require('backo')
const MAX_ATTEMPTS = 5
const MIN_BACKOFF_INTERVAL = process.env.BUGSNAG_MIN_BACKOFF_INTERVAL || 500
const MAX_BACKOFF_INTERVAL = process.env.BUGSNAG_MAX_BACKOFF_INTERVAL || 5000

module.exports = (url, formData) => {
  return new Promise((resolve, reject) => {
    const backoff = new Backoff({ min: MIN_BACKOFF_INTERVAL, max: MAX_BACKOFF_INTERVAL })

    const onSuccess = () => resolve()
    const onError = (err) => {
      if (backoff.attempts >= MAX_ATTEMPTS - 1) return reject(err)
      if (err.statusCode >= 400 && err.statusCode < 500) return reject(err)
      setTimeout(() => req(url, formData, onError, onSuccess), backoff.duration())
    }

    req(url, formData, onError, onSuccess)
  })
}

const req = (url, formData, onError, onSuccess) => {
  request.post({ url, formData }, function (err, res, body) {
    if (err || res.statusCode !== 200) {
      err = err || new Error(`${res.statusMessage} (${res.statusCode}) - ${body}`)
      if (res.statusCode) err.statusCode = res.statusCode
      onError(err)
    } else {
      onSuccess()
    }
  })
}
