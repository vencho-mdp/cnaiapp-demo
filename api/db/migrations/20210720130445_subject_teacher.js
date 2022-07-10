exports.up = async function (knex) {
  return knex.schema.createTable('subject_teacher', (table) => {
    table.primary(['subject_id', 'teacher_id'])

    table
      .uuid('subject_id')
      .references('id')
      .inTable('subject')
      .notNullable()
      .onDelete('CASCADE')

    table
      .uuid('teacher_id')
      .references('id')
      .inTable('user')
      .notNullable()
      .onDelete('CASCADE')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('subject_teacher')
}
