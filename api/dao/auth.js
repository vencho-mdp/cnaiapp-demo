const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const db = require('../db/db')

const DEFAULT_REFRESH_TOKEN_EXPIRATION = '14 days'
const DEFAULT_ACCESS_TOKEN_EXPIRATION = '30m'

class User_DAO {
  async login (email, password) {
    try {
      const user_real_info = await db('user')
        .where({ email })
        .andWhere('user.hide', 'false')
        .join('user_group', 'user.id', 'user_id')
        .leftJoin('subject_teacher', 'user.id', 'subject_teacher.teacher_id')
        .leftJoin('subject', function () {
          this.onIn('subject.id', db.raw('subject_teacher.subject_id'))
        })
        .leftJoin('group', function () {
          this.onIn('group_id', db.raw('"group".id'))
        })
        .join('user_class', 'user.id', 'user_class.user_id')
        .select(
          'password',
          'email',
          db.raw('ARRAY_AGG(DISTINCT "subject".name) AS subject_names'),
          db.raw('"user".id'),
          db.raw('ARRAY_AGG(DISTINCT "group".name) AS group_names'),
          db.raw('ARRAY_AGG("user_class".class_id) AS classes_ids')
        )
        .groupBy('user.id', 'password')
        .first()

      if (!user_real_info) {
        throw new Error('Not Found')
      }

      const check_password = await bcrypt.compare(
        password,
        user_real_info.password
      )

      if (!check_password) {
        throw new Error('Invalid password')
      }

      const information_to_token = {
        id: user_real_info.id,
        groups: user_real_info.group_names,
        classes_ids: user_real_info.group_names.includes('management_team')
          ? (await db('class').select('id')).map(el => el.id)
          : user_real_info.classes_ids,
        email: user_real_info.email,
        subjects: user_real_info.subject_names
      }

      if (!user_real_info.group_names.includes('teacher')) {
        delete information_to_token.subjects
      }

      const token = jwt.sign(
        information_to_token,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: DEFAULT_ACCESS_TOKEN_EXPIRATION }
      )

      const refresh_token = jwt.sign(
        information_to_token,
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: DEFAULT_REFRESH_TOKEN_EXPIRATION }
      )
      return { token, refresh_token }
    } catch (error) {
      console.log(error)
    }
  }

  async token (refresh_token) {
    const { id } = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET)
    const user_real_info = await db('user')
      .where('user.id', id)
      .andWhere('user.hide', 'false')
        .join('user_group', 'user.id', 'user_id')
        .leftJoin('subject_teacher', 'user.id', 'subject_teacher.teacher_id')
        .leftJoin('subject', function () {
          this.onIn('subject.id', db.raw('subject_teacher.subject_id'))
        })
        .leftJoin('group', function () {
          this.onIn('group_id', db.raw('"group".id'))
        })
        .join('user_class', 'user.id', 'user_class.user_id')
        .select(
          'password',
          'email',
          db.raw('ARRAY_AGG(DISTINCT "subject".name) AS subject_names'),
          db.raw('"user".id'),
          db.raw('ARRAY_AGG(DISTINCT "group".name) AS group_names'),
          db.raw('ARRAY_AGG("user_class".class_id) AS classes_ids')
        )
        .groupBy('user.id', 'password')
        .first()

    const information_to_token = {
      id: user_real_info.id,
      groups: user_real_info.group_names,
      classes_ids: user_real_info.group_names.includes('management_team')
        ? (await db('class').select('id')).map(el => el.id)
        : user_real_info.classes_ids,
      email: user_real_info.email,
      subjects: user_real_info.subject_names
    }
    if (!user_real_info.group_names.includes('teacher')) {
      delete information_to_token.subjects
    }
    const new_token = jwt.sign(
      information_to_token,
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: DEFAULT_ACCESS_TOKEN_EXPIRATION
      }
    )

    return {
      token: new_token
    }
  }
}

module.exports = new User_DAO()
