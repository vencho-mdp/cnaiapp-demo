const {
  add_bug
} = require('../dao/bugs')

class Bugs_service {
  async add_bug (bug) {
    try {
      return await add_bug(bug)
    } catch (error) {
      throw {
        status: 409,
        code: 'REQUEST_CONFLICT',
        msg: 'The request could not be processed because of conflict in the request.'
      }
    }
  }
}

module.exports = new Bugs_service()
