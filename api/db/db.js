const knex = require('knex')
const consola = require('consola')
const knexfile = require('./knexfile')

const mode =
  process.env.NODE_ENV === 'production' ? 'production' : 'development'
if (mode === 'production') {
  consola.info('Running in production')
}
const db = knex(knexfile[mode])
module.exports = db
