const class_DAO = require('../dao/classes')

class class_service {
  async get_classes (u_id) {
    try {
      return await class_DAO.get_classes(u_id)
    } catch (error) {
      console.log(error)
      throw {
        status: 500,
        code: 'INTERNAL_ERROR',
        msg: 'Internal server error.'
      }
    }
  }
}

module.exports = new class_service()
