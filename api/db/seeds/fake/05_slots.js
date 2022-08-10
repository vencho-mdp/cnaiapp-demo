const getSubjectId = require('../utils/getSubjectId')

exports.seed = async function (knex) {
  await knex('slot').del()

  // 27 Records
  const data = [
    {
      class: '3ro 2da',
      slot: [
        {
          weekday: 'Lunes',
          assignments: [
            {
              subject: 'Matemática',
              start_time: '12:55',
              end_time: '14:10'
            },
            {
              subject: 'Lengua',
              start_time: '14:10',
              end_time: '15:30'
            },
            {
              subject: 'Química',
              start_time: '15:45',
              end_time: '17:00'
            }
          ]
        },
        {
          weekday: 'Martes',
          assignments: [
            {
              subject: 'Matemática',
              start_time: '12:55',
              end_time: '14:10'
            },
            {
              subject: 'Lengua',
              start_time: '14:10',
              end_time: '15:30'
            },
            {
              subject: 'Formación ética',
              start_time: '15:45',
              end_time: '17:35'
            }
          ]
        },
        {
          weekday: 'Miércoles',
          assignments: [
            {
              subject: 'Matemática',
              start_time: '13:30',
              end_time: '14:10'
            },
            {
              subject: 'Física',
              start_time: '14:10',
              end_time: '15:30'
            },
            {
              subject: 'Historia',
              start_time: '15:45',
              end_time: '17:35'
            }
          ]
        },
        {
          weekday: 'Jueves',
          assignments: [
            {
              subject: 'Lengua',
              start_time: '14:10',
              end_time: '15:30'
            },
            {
              subject: 'Geografía',
              start_time: '15:45',
              end_time: '17:35'
            }
          ]
        },
        {
          weekday: 'Viernes',
          assignments: [
            {
              subject: 'Música',
              start_time: '14:10',
              end_time: '15:30'
            },
            {
              subject: 'Biología',
              start_time: '15:45',
              end_time: '17:35'
            }
          ]
        }
      ]
    },
    {
      class: '3ro 4ta',
      slot: [
        {
          weekday: 'Lunes',
          assignments: [
            {
              subject: 'Formación ética',
              start_time: '13:30',
              end_time: '15:30'
            }
          ]
        },
        {
          weekday: 'Martes',
          assignments: [
            {
              subject: 'Música',
              start_time: '12:55',
              end_time: '14:10'
            },
            {
              subject: 'Matemática',
              start_time: '14:10',
              end_time: '15:30'
            },
            {
              subject: 'Lengua',
              start_time: '15:45',
              end_time: '17:00'
            }
          ]
        },
        {
          weekday: 'Miércoles',
          assignments: [
            {
              subject: 'Física',
              start_time: '13:30',
              end_time: '14:10'
            },
            {
              subject: 'Lengua',
              start_time: '14:10',
              end_time: '15:30'
            },
            {
              subject: 'Matemática',
              start_time: '15:45',
              end_time: '17:00'
            },
            {
              subject: 'Geografía',
              start_time: '17:00',
              end_time: '17:35'
            }
          ]
        },
        {
          weekday: 'Jueves',
          assignments: [
            {
              subject: 'Lengua',
              start_time: '12:55',
              end_time: '14:10'
            },
            {
              subject: 'Historia',
              start_time: '14:10',
              end_time: '16:20'
            },
            {
              subject: 'Matemática',
              start_time: '16:20',
              end_time: '17:00'
            }
          ]
        },
        {
          weekday: 'Viernes',
          assignments: [
            {
              subject: 'Química',
              start_time: '12:55',
              end_time: '14:10'
            },
            {
              subject: 'Biología',
              start_time: '14:10',
              end_time: '16:20'
            },
            {
              subject: 'Geografía',
              start_time: '16:20',
              end_time: '17:00'
            }
          ]
        }
      ]
    }
  ]

  const getClassId = async (className) => {
    const [grade, grade_number] = className.split(' ')
    return (await knex('class').select('id').where({ grade, grade_number }))[0]
      .id
  }

  const dataToInsert = []

  // TODO: improve performance
  for (const classAssignments of data) {
    for (const eachDayAssignments of classAssignments.slot) {
      for (const assignment of eachDayAssignments.assignments) {
        currentItem = {
          weekday: eachDayAssignments.weekday,
          end_time: assignment.end_time,
          start_time: assignment.start_time,
          class_id: await getClassId(classAssignments.class),
          subject_id: await getSubjectId(assignment.subject, knex)
        }
        dataToInsert.push(currentItem)
      }
    }
  }
  return knex('slot').insert(dataToInsert)
}
