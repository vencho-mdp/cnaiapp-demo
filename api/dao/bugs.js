const sanitize = require('sanitize-html')
const db = require('../db/db')

class Bugs_DAO {
  async add_bug (bug) {
    const { description, route } = bug
    const sanitized_description = sanitize(description)
    await db('bug').insert({ description: sanitized_description, route })
  }
}

module.exports = new Bugs_DAO()
