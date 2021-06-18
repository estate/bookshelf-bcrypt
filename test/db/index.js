'use strict'

const fs = require('fs')
const path = require('path')
const config = require('./knexfile')
const knex = require('knex')(config.development)
const bookshelf = require('bookshelf')(knex)

// Install all necessary plugins
bookshelf.plugin(require('../../'))

module.exports = {
  knex,
  bookshelf,
  reset: () => knex.raw('SELECT name FROM sqlite_master WHERE type = "table"')
    .then((tables) => {
      const promises = tables
        .filter((table) => !table.name.match(/^sqlite/))
        .map((table) => knex.raw(`DROP TABLE IF EXISTS ${table.name}`))

      return Promise.all(promises)
    })
    .then(() => knex.migrate.latest())
}

// Load all models
fs.readdirSync(path.join(__dirname, 'models'))
  .forEach((model) => require(path.join(__dirname, 'models', model)))
