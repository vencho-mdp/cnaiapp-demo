exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  return knex.schema.createTable('subject', (table) => {
    table
      .uuid('id')
      .primary()
      .unique()
      .defaultTo(knex.raw('uuid_generate_v4()'))
    table.text('name').notNullable().unique()
    table.boolean('hide').defaultTo('false')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('subject')
}
