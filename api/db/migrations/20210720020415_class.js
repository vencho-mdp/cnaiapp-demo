exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  return knex.schema.createTable('class', (table) => {
    table
      .uuid('id')
      .primary()
      .unique()
      .defaultTo(knex.raw('uuid_generate_v4()'))
    table.text('grade').notNullable()
    table.text('grade_number').notNullable()
    table.boolean('hide').defaultTo('false')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('class')
}
