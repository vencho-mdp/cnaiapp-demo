exports.up = async function (knex) {
  return knex.schema.createTable('slot_teacher', (table) => {
    table.primary(['slot_id', 'teacher_id'])
    table
      .uuid('slot_id')
      .references('id')
      .inTable('slot')
      .notNullable()
      .onDelete('CASCADE')

    table
      .uuid('teacher_id')
      .references('id')
      .inTable('user')
      .notNullable()
      .onDelete('CASCADE')

    table.boolean('hide').defaultTo('false')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('slot_teacher')
}
