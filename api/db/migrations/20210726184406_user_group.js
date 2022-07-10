exports.up = async function (knex) {
  return knex.schema.createTable('user_group', (table) => {
    table.primary(['user_id', 'group_id'])

    table
      .uuid('user_id')
      .references('id')
      .inTable('user')
      .notNullable()
      .onDelete('CASCADE')

    table
      .uuid('group_id')
      .references('id')
      .inTable('group')
      .notNullable()
      .onDelete('CASCADE')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('user_group')
}
