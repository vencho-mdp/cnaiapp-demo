exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

  return knex.schema.createTable('news', (table) => {
    table
      .uuid('id')
      .primary()
      .unique()
      .defaultTo(knex.raw('uuid_generate_v4()'))

    table.text('title').notNullable()

    table.text('content').notNullable()

    table.text('image_extension')

    table.timestamp('created_at').defaultTo(knex.fn.now())

    table.boolean('hide').defaultTo('false')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('news')
}
