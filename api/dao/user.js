const bcrypt = require('bcryptjs')
const db = require('../db/db')

class user_dao {
  async change_email (user_id, password, new_email) {
    const { password: real_password } = await db('user').select('password').where('id', user_id).first()
    const check_password = await bcrypt.compare(password, real_password)
    if (!check_password) { throw new Error() }
    await db('user').update('email', new_email).where('id', user_id)
  }

  async change_password (user_id, current_password, new_password) {
    const { password: real_password } = await db('user').select('password').where('id', user_id).first()
    const check_password = await bcrypt.compare(current_password, real_password)
    if (!check_password) { throw new Error() }
    const encrypted_password = await bcrypt.hash(new_password, 10)
    await db('user').update('password', encrypted_password).where('id', user_id)
  }
}

module.exports = new user_dao()
