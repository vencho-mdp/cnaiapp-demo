const db = require('../db/db')

class teachers_DAO {
  async get_all_teachers () {
    const res = await db('user')
      .select(
        db.raw("CONCAT(last_name, ', ', first_name) AS full_name, \"user\".id")
      )
      .where('user.hide', false)
      .andWhere('name', 'teacher')
      .join('user_group', 'user.id', 'user_id')
      .join('group', 'group_id', 'group.id')
      .orderBy('last_name')

    return res
  }

  async get_teachers_class (teacher_id) {
    const slots = await db('slot')
      .select(
        'slot.weekday',
        'slot.start_time',
        'slot.weekday',
        'slot.end_time',
        db.raw('subject.name AS subject_name'),
        db.raw("CONCAT(grade, ' ', grade_number) AS course_name")
      )
      .where({ teacher_id })
      .andWhere('slot.hide', 'false')
      .join('slot_teacher', 'slot_teacher.slot_id', '=', 'slot.id')
      .join('user', 'slot_teacher.teacher_id', '=', 'user.id')
      .join('subject', 'slot.subject_id', '=', 'subject.id')
      .join('class', 'class.id', '=', 'slot.class_id')
      .groupBy(
        'slot.weekday',
        'slot.start_time',
        'slot.weekday',
        'slot.end_time',
        'subject.name',
        'class.grade',
        'class.grade_number'
      )

    const organized_slots = slots.reduce(
      (acc, { weekday, ...rest }) => {
        const index_of_weekday_object = acc.findIndex(
          el => el.weekday === weekday
        )
        acc[index_of_weekday_object].assignments.push(rest)
        return acc
      },
      [
        { weekday: 'Lunes', assignments: [] },
        { weekday: 'Martes', assignments: [] },
        { weekday: 'Miércoles', assignments: [] },
        { weekday: 'Jueves', assignments: [] },
        { weekday: 'Viernes', assignments: [] }
      ]
    )
    return organized_slots
  }
}

module.exports = new teachers_DAO()
