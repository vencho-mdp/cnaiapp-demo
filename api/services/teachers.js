const { get_all_teachers, get_teachers_class } = require('../dao/teachers')

class teacher_service {
  async get_all_teachers () {
    try {
      return await get_all_teachers()
    } catch (error) {
      console.log(error)
      throw {
        status: 500,
        code: 'INTERNAL_ERROR',
        msg: 'Internal server error.'
      }
    }
  }

  async get_teachers_class (teacher_id) {
    try {
      return await get_teachers_class(teacher_id)
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

module.exports = new teacher_service()
