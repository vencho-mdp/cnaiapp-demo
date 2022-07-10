exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

  return knex.schema.createTable('teacher_absence', (table) => {
    table
      .uuid('id')
      .primary()
      .unique()
      .defaultTo(knex.raw('uuid_generate_v4()'))

    table
      .uuid('teacher_id')
      .references('id')
      .inTable('user')
      .notNullable()
      .onDelete('CASCADE')

    table.date('start_date').notNullable()

    table.date('end_date').notNullable()

    table.boolean('hide').defaultTo('false')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('teacher_absence')
}
