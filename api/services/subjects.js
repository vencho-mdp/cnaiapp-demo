const { get_subjects } = require('../dao/subjects')

class subject_service {
  async get_subjects () {
    try {
      return await get_subjects()
    } catch (error) {
      throw {
        status: 500,
        code: 'INTERNAL_ERROR',
        msg: 'Internal server error.'
      }
    }
  }
}

module.exports = new subject_service()
