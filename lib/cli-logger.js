const kleur = require('kleur')

module.exports = {
  debug: console.log.bind(this, kleur.gray('[debug]')),
  info: console.log.bind(this, kleur.blue('[info]')),
  warn: console.log.bind(this, kleur.yellow('[warn]')),
  error: console.log.bind(this, kleur.red('[error]'))
}
