const { change_email, change_password } = require('../dao/user')

class User_service {
  async change_email (body) {
    try {
      const { user_id, password, new_email } = body
      await change_email(user_id, password, new_email)
      return
    } catch (error) {
      throw {
        msg: 'Incorrect Password'
      }
    }
  }

  async change_password (body) {
    try {
      const { user_id, current_password, new_password } = body
      await change_password(user_id, current_password, new_password)
      return
    } catch (error) {
      throw {
        msg: 'Incorrect Password'
      }
    }
  }
}

module.exports = new User_service()
