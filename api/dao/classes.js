const db = require('../db/db')

const getUniqueListById = require('../utils/get_unique_list_by_id')

class class_DAO {
  async get_classes (u_id) {
    if (!u_id) {
      return await db('class')
        .select(db.raw("CONCAT(grade,' ' ,grade_number) AS class"), 'id')
        .where('hide', 'false')
    }
    const user_groups = (await db('user_group')
      .select('name')
      .join('group', function () {
        this.onIn('id', db.raw('"user_group".group_id'))
      })
      .where({ user_id: u_id })).map(el => el.name)

    if (user_groups.includes('management_team')) {
      return await db('class')
        .select(db.raw("CONCAT(grade,' ' ,grade_number) AS class"), 'id')
        .where('hide', 'false')
    }

    const user_classes = await db('class')
      .select(db.raw("CONCAT(grade,' ' ,grade_number) AS class"), 'id')
      .join('user_class', db.raw('"user_class".class_id'), '=', 'class.id')
      .where('user_class.user_id', u_id)
      .andWhere('hide', 'false')

    const classes_that_share_grade = await db('class')
      .select(db.raw("CONCAT(grade,' ' ,grade_number) AS class"), 'id')
      .whereIn('grade', user_classes.map(el => el.class.split(' ')[0]))
      .andWhere('hide', 'false')

    return getUniqueListById([...user_classes, ...classes_that_share_grade], 'id')
  }
}

module.exports = new class_DAO()
