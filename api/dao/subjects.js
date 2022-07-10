const db = require('../db/db')

class subject_DAO {
  async get_subjects () {
    const data = await db('subject')
      .select('subject.id', 'subject.name', 'user.id AS teacher_id')
      .where('subject.hide', 'false')
      .innerJoin('subject_teacher', 'subject.id', 'subject_teacher.subject_id')
      .innerJoin('user', 'user.id', 'subject_teacher.teacher_id')

    return data.reduce((acc, val) => {
      const subject_index = acc.findIndex(el => el.id === val.id)
      if (subject_index > -1) {
        acc[subject_index].teachers_ids.push(val.teacher_id)
      } else {
        acc.push({
          name: val.name,
          id: val.id,
          teachers_ids: [val.teacher_id]
        })
      }
      return acc
    }, [])
  }
}

module.exports = new subject_DAO()
