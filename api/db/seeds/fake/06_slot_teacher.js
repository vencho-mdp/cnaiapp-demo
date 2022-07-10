exports.seed = async function (knex) {
  await knex('slot_teacher').del()

  // Students don't have a subject twice in the same day
  // Teachers dont do two classes to the same class in the same day
  const data = [
    {
      class: '3ro 2da',
      references: [
        {
          weekday: 'Lunes',
          teachers: ['Paula Ainchil', 'Maia Gorostegui', 'Silvia Santoiani']
        },
        {
          weekday: 'Martes',
          teachers: ['Paula Ainchil', 'Maia Gorostegui', 'Mario Rusos']
        },
        {
          weekday: 'Miércoles',
          teachers: ['Paula Ainchil', 'Gabriel Pérez', 'Matías Wibaux']
        },
        {
          weekday: 'Jueves',
          teachers: ['Maia Gorostegui', 'Alberto Villavicencio']
        },
        {
          weekday: 'Viernes',
          teachers: ['Jorge Pitaluga', 'Mara Martinez']
        }
      ]
    },
    {
      class: '3ro 4ta',
      references: [
        {
          weekday: 'Lunes',
          teachers: ['Mario Rusos']
        },
        {
          weekday: 'Martes',
          teachers: ['Paula Ainchil', 'Jorge Pitaluga', 'Maia Gorostegui']
        },
        {
          weekday: 'Miércoles',
          teachers: [
            'Paula Ainchil',
            'Gabriel Pérez',
            'Maia Gorostegui',
            'Ruben Frías'
          ]
        },
        {
          weekday: 'Jueves',
          teachers: ['Paula Ainchil', 'Benjamín Rodriguez', 'Maia Gorostegui']
        },
        {
          weekday: 'Viernes',
          teachers: ['Silvia Santoiani', 'Ruben Frías', 'Soledad Esquius']
        }
      ]
    }
  ]

  const getTeacherIdAndItsSubjects = async (teacherName) => {
    const [first_name, last_name] = teacherName.split(' ')
    const id = (
      await knex('user').select('id').where({ first_name, last_name })
    )[0].id

    const subjects_ids = await knex('subject_teacher')
      .select('subject_id')
      .where('teacher_id', id)

    return {
      id,
      subjects_ids: subjects_ids.map(el => el.subject_id)
    }
  }

  const getSlotId = async ({ class_id, subjects_ids, weekday }) => {
    const query = await knex('slot')
      .select('id')
      .where((builder) => {
        builder.whereIn('subject_id', subjects_ids)
      })
      .andWhere({ class_id, weekday })
    return query[0].id
  }

  const getClassId = async (className) => {
    const [grade, grade_number] = className.split(' ')
    return (await knex('class').select('id').where({ grade, grade_number }))[0]
      .id
  }

  const dataToInsert = []

  // TODO: improve performance
  // even though these are just migrations

  for (const iterator of data) {
    const class_id = await getClassId(iterator.class)
    for (const reference of iterator.references) {
      for (const teacher of reference.teachers) {
        const { id: teacher_id, subjects_ids } =
          await getTeacherIdAndItsSubjects(teacher)

        const slot_id = await getSlotId({
          weekday: reference.weekday,
          subjects_ids,
          class_id
        })

        dataToInsert.push({
          teacher_id,
          slot_id
        })
      }
    }
  }

  return knex('slot_teacher').insert(dataToInsert)
}
