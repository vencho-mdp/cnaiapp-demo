const {
  get_all_absent_teachers,
  add_absent_teacher,
  update_absent_teacher,
  delete_absent_teacher
} = require('../dao/teachers_absence')

class teachers_absence_service {
  async get_all_absent_teachers () {
    try {
      return await get_all_absent_teachers()
    } catch (error) {
      throw {
        status: 500,
        code: 'INTERNAL_ERROR',
        msg: 'Internal server error.'
      }
    }
  }

  async add_absent_teacher (new_record) {
    try {
      return await add_absent_teacher(new_record)
    } catch (error) {
      throw {
        status: 409,
        code: 'REQUEST_CONFLICT',
        msg: 'The request could not be processed because of conflict in the request.'
      }
    }
  }

  async update_absent_teacher (data) {
    try {
      return await update_absent_teacher(data)
    } catch (error) {
      throw {
        status: 404,
        code: 'NOT_FOUND',
        msg: 'Not found.'
      }
    }
  }

  async delete_absent_teacher (data) {
    try {
      return await delete_absent_teacher(data)
    } catch (error) {
      throw {
        status: 400,
        code: 'BAD_REQUEST',
        msg: 'Bad Request response.'
      }
    }
  }
}

module.exports = new teachers_absence_service()
